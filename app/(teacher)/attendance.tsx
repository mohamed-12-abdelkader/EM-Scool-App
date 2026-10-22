import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button } from '@/components/ui';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  clearOfflineAttendance,
  loadOfflineAttendance,
  offlineStorageMode,
  queueOfflineAttendance,
  type OfflineAttendanceEntry,
} from '@/lib/attendanceOffline';
import { arFonts, colors, radii, shadows, spacing } from '@/theme/tokens';

type Row = { id: string; full_name: string; status: OfflineAttendanceEntry['status'] };
type Section = { id: string; name: string; grade_level_id: string };

function tone(s: Row['status']) {
  if (s === 'PRESENT') return 'emerald' as const;
  if (s === 'LATE') return 'amber' as const;
  if (s === 'ABSENT') return 'rose' as const;
  return 'slate' as const;
}

const statusAr: Record<Row['status'], string> = {
  PRESENT: 'حاضر',
  ABSENT: 'غائب',
  LATE: 'متأخر',
  EXCUSED: 'بعذر',
};

export default function TeacherAttendance() {
  const { accessToken, user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionId, setSectionId] = useState<string>('');
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const headers = {
    token: accessToken || undefined,
    tenantId: user?.tenantId || undefined,
    branchId: user?.branchIds?.[0],
  };

  useEffect(() => {
    void apiRequest<Section[]>('/v1/tenants/me/sections', headers)
      .then((list) => {
        setSections(list);
        if (list[0]) setSectionId(list[0].id);
      })
      .catch(() => setSections([]));

    // Auto-sync any offline queue when the screen opens
    void (async () => {
      const queued = await loadOfflineAttendance();
      if (!queued.length) return;
      try {
        await apiRequest('/v1/sis/attendance/batch', {
          method: 'POST',
          ...headers,
          body: { entries: queued.map(({ queuedAt, ...e }) => e) },
        });
        await clearOfflineAttendance();
        setMessage(`تمت مزامنة ${queued.length} سجل معلّق تلقائياً`);
      } catch {
        setMessage(`${queued.length} سجل بانتظار المزامنة (وضع: ${offlineStorageMode()})`);
      }
    })();
  }, []);

  const loadStudents = async () => {
    setBusy(true);
    try {
      const students = await apiRequest<
        { id: string; full_name: string; current_section_id?: string | null }[]
      >('/v1/sis/students', headers);
      const filtered = sectionId
        ? students.filter((s) => !s.current_section_id || s.current_section_id === sectionId)
        : students;
      setRows(filtered.map((s) => ({ id: s.id, full_name: s.full_name, status: 'PRESENT' })));
      setMessage(`تم تحميل ${filtered.length} طالب${sectionId ? ' لهذا الفصل' : ''}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'فشل التحميل');
    } finally {
      setBusy(false);
    }
  };

  const cycle = (id: string) => {
    const order: Row['status'][] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return { ...r, status: order[(order.indexOf(r.status) + 1) % order.length] };
      }),
    );
  };

  const setStatus = (id: string, status: Row['status']) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const saveOnlineOrOffline = async () => {
    if (!sectionId) {
      setMessage('لا يوجد فصل — شغّل إعداد Phase 1 من مشرف المنصة أولاً');
      return;
    }
    setBusy(true);
    const today = new Date().toISOString().slice(0, 10);
    const entries: OfflineAttendanceEntry[] = rows.map((r) => ({
      student_id: r.id,
      section_id: sectionId,
      attendance_date: today,
      period_number: 0,
      status: r.status,
      source: 'MOBILE_APP',
      queuedAt: new Date().toISOString(),
    }));

    try {
      await apiRequest('/v1/sis/attendance/batch', {
        method: 'POST',
        ...headers,
        body: { entries: entries.map(({ queuedAt, ...e }) => e) },
      });
      setMessage('تم الحفظ على الخادم · تنبيهات الغياب تُجدول عند توفر Redis');
    } catch {
      await queueOfflineAttendance(entries);
      setMessage('بدون اتصال — حُفظ محلياً للمزامنة لاحقاً');
    } finally {
      setBusy(false);
    }
  };

  const syncOffline = async () => {
    setBusy(true);
    try {
      const queued = await loadOfflineAttendance();
      if (!queued.length) {
        setMessage('لا سجلات معلّقة');
        return;
      }
      await apiRequest('/v1/sis/attendance/batch', {
        method: 'POST',
        ...headers,
        body: { entries: queued.map(({ queuedAt, ...e }) => e) },
      });
      await clearOfflineAttendance();
      setMessage(`تمت مزامنة ${queued.length} سجل`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'فشلت المزامنة');
    } finally {
      setBusy(false);
    }
  };

  const present = rows.filter((r) => r.status === 'PRESENT').length;
  const absent = rows.filter((r) => r.status === 'ABSENT').length;
  const late = rows.filter((r) => r.status === 'LATE').length;
  const excused = rows.filter((r) => r.status === 'EXCUSED').length;

  return (
    <View style={styles.root}>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Animated.View entering={FadeInDown.duration(280)} style={styles.hero}>
              <Text style={styles.h1}>مناداة الحضور</Text>
              <Text style={styles.sub}>اضغط على الحالة لتغييرها — أو مرّر على اسم الطالب للتبديل السريع</Text>
            </Animated.View>

            <View style={styles.pills}>
              {sections.map((s) => (
                <AnimatedPressable
                  key={s.id}
                  onPress={() => setSectionId(s.id)}
                  style={[styles.pill, sectionId === s.id && styles.pillActive]}
                >
                  <Text style={[styles.pillText, sectionId === s.id && styles.pillTextActive]}>
                    فصل {s.name}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
            {!sections.length ? (
              <Text style={styles.warn}>لا فصول — سجّل دخول مدير المدرسة بعد تجهيز Phase 1</Text>
            ) : null}

            <View style={styles.kpis}>
              <Kpi n={present} label="حاضر" color={colors.statusSuccess} />
              <Kpi n={absent} label="غائب" color={colors.statusDanger} />
              <Kpi n={late} label="متأخر" color={colors.statusWarning} />
              <Kpi n={excused} label="بعذر" color={colors.textMuted} />
            </View>

            <View style={styles.toolbar}>
              <Button
                label={busy ? '…' : 'تحميل الطلاب'}
                onPress={() => void loadStudents()}
                disabled={busy || !sectionId}
              />
              <Button
                label="حفظ الحضور"
                onPress={() => void saveOnlineOrOffline()}
                disabled={!rows.length || busy}
              />
              <Button
                label="مزامنة دون اتصال"
                variant="outline"
                onPress={() => void syncOffline()}
                disabled={busy}
              />
            </View>

            {message ? (
              <View style={styles.msgBox}>
                <Text style={styles.msg}>{message}</Text>
              </View>
            ) : null}

            {rows.length ? (
              <Text style={styles.listLabel}>{rows.length} طالب — اضغط لتغيير الحالة</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>لا طلاب محملين بعد</Text>
            <Text style={styles.emptyBody}>اختر الفصل ثم اضغط «تحميل الطلاب»</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(220)}>
            <AnimatedPressable onPress={() => cycle(item.id)} style={[styles.row, shadows.sm]}>
              <View style={styles.rowMain}>
                <View style={[styles.avatar, { backgroundColor: softFor(item.status) }]}>
                  <Text style={styles.avatarText}>{item.full_name.trim().slice(0, 1)}</Text>
                </View>
                <Text style={styles.name} numberOfLines={1}>
                  {item.full_name}
                </Text>
              </View>
              <View style={styles.statusRow}>
                {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((s) => (
                  <AnimatedPressable
                    key={s}
                    onPress={() => setStatus(item.id, s)}
                    style={[styles.statusChip, item.status === s && styles.statusChipOn]}
                  >
                    <Text
                      style={[styles.statusChipText, item.status === s && styles.statusChipTextOn]}
                    >
                      {statusAr[s]}
                    </Text>
                  </AnimatedPressable>
                ))}
              </View>
              <PillBadge label={statusAr[item.status]} tone={tone(item.status)} />
            </AnimatedPressable>
          </Animated.View>
        )}
      />
    </View>
  );
}

function softFor(status: Row['status']) {
  if (status === 'PRESENT') return colors.statusSuccessSoft;
  if (status === 'ABSENT') return colors.statusDangerSoft;
  if (status === 'LATE') return colors.statusWarningSoft;
  return colors.brandSoft;
}

function Kpi({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={[styles.kpiN, { color }]}>{n}</Text>
      <Text style={styles.kpiL}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },
  listContent: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    gap: 10,
  },
  headerBlock: { gap: 12, paddingTop: spacing.xl, paddingBottom: 4 },
  hero: { gap: 6, alignItems: 'flex-end' },
  h1: {
    fontFamily: arFonts.extraBold,
    fontSize: 26,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  sub: {
    fontFamily: arFonts.regular,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 22,
  },
  pills: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.bgSurface,
  },
  pillActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  pillText: { fontFamily: arFonts.semiBold, color: colors.textSecondary },
  pillTextActive: { color: '#fff' },
  warn: { fontFamily: arFonts.medium, color: colors.statusWarning, textAlign: 'right' },
  kpis: { flexDirection: 'row-reverse', gap: 8 },
  kpi: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 12,
    alignItems: 'center',
  },
  kpiN: { fontFamily: arFonts.monoMedium, fontSize: 22, fontVariant: ['tabular-nums'] },
  kpiL: { fontFamily: arFonts.medium, fontSize: 11, color: colors.textMuted },
  toolbar: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  msgBox: {
    backgroundColor: colors.brandSoft,
    borderRadius: radii.lg,
    padding: 12,
  },
  msg: { fontFamily: arFonts.medium, color: colors.brandPrimary, textAlign: 'right' },
  listLabel: {
    fontFamily: arFonts.semiBold,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  empty: { paddingVertical: 40, alignItems: 'center', gap: 6 },
  emptyTitle: { fontFamily: arFonts.bold, fontSize: 16, color: colors.textPrimary },
  emptyBody: { fontFamily: arFonts.regular, fontSize: 13, color: colors.textMuted },
  row: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    gap: 10,
  },
  rowMain: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: arFonts.bold, fontSize: 16, color: colors.textPrimary },
  name: {
    flex: 1,
    fontFamily: arFonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  statusRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.bgCanvas,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  statusChipOn: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  statusChipText: { fontFamily: arFonts.semiBold, fontSize: 11, color: colors.textSecondary },
  statusChipTextOn: { color: '#fff' },
});
