import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Button } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  clearOfflineAttendance,
  loadOfflineAttendance,
  queueOfflineAttendance,
  type OfflineAttendanceEntry,
} from '@/lib/attendanceOffline';
import { arFonts, colors, radii, shadows } from '@/theme/tokens';

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
  }, []);

  const loadStudents = async () => {
    const students = await apiRequest<
      { id: string; full_name: string; current_section_id?: string | null }[]
    >('/v1/sis/students', headers);
    const filtered = sectionId
      ? students.filter((s) => !s.current_section_id || s.current_section_id === sectionId)
      : students;
    setRows(filtered.map((s) => ({ id: s.id, full_name: s.full_name, status: 'PRESENT' })));
    setMessage(`تم تحميل ${filtered.length} طالب${sectionId ? ' لهذا الفصل' : ''}`);
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

  const saveOnlineOrOffline = async () => {
    if (!sectionId) {
      setMessage('لا يوجد فصل — شغّل إعداد Phase 1 من مشرف المنصة أولاً');
      return;
    }
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
    }
  };

  const syncOffline = async () => {
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
  };

  const present = rows.filter((r) => r.status === 'PRESENT').length;
  const absent = rows.filter((r) => r.status === 'ABSENT').length;
  const late = rows.filter((r) => r.status === 'LATE').length;

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>الحضور · مناداة صباحية</Text>
      <Text style={styles.sub}>اختر الفصل ثم حمّل الطلاب ومرّر على الحالة</Text>

      <View style={styles.pills}>
        {sections.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => setSectionId(s.id)}
            style={[styles.pill, sectionId === s.id && styles.pillActive]}
          >
            <Text style={[styles.pillText, sectionId === s.id && { color: '#fff' }]}>فصل {s.name}</Text>
          </Pressable>
        ))}
      </View>
      {!sections.length ? (
        <Text style={styles.warn}>لا فصول — سجّل دخول مدير المدرسة بعد تجهيز Phase 1</Text>
      ) : null}

      <View style={styles.kpis}>
        <View style={styles.kpi}>
          <Text style={styles.kpiN}>{present}</Text>
          <Text style={styles.kpiL}>حاضر</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiN}>{absent}</Text>
          <Text style={styles.kpiL}>غائب</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiN}>{late}</Text>
          <Text style={styles.kpiL}>متأخر</Text>
        </View>
      </View>

      <Button label="تحميل الطلاب" onPress={() => void loadStudents().catch((e) => setMessage(String(e)))} />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => cycle(item.id)} style={[styles.row, shadows.sm]}>
            <Text style={styles.name}>{item.full_name}</Text>
            <PillBadge label={statusAr[item.status]} tone={tone(item.status)} />
          </Pressable>
        )}
      />
      <Button label="حفظ الحضور" onPress={() => void saveOnlineOrOffline()} disabled={!rows.length} />
      <Button label="مزامنة السجلات دون اتصال" variant="outline" onPress={() => void syncOffline()} />
      {message ? <Text style={styles.msg}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 10, backgroundColor: colors.bgCanvas },
  h1: { fontFamily: arFonts.extraBold, fontSize: 24, color: colors.textPrimary, textAlign: 'right' },
  sub: { fontFamily: arFonts.regular, color: colors.textSecondary, textAlign: 'right' },
  pills: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.bgSurface,
  },
  pillActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  pillText: { fontFamily: arFonts.semiBold, color: colors.textSecondary },
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
  kpiN: { fontFamily: arFonts.monoMedium, fontSize: 22, color: colors.brandPrimary, fontVariant: ['tabular-nums'] },
  kpiL: { fontFamily: arFonts.medium, fontSize: 12, color: colors.textMuted },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
  },
  name: { fontFamily: arFonts.semiBold, color: colors.textPrimary },
  msg: { fontFamily: arFonts.medium, color: colors.brandPrimary, textAlign: 'center' },
});
