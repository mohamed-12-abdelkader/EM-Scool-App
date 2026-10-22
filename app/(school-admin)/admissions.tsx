import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Platform } from 'react-native';
import { Button } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { arFonts, colors, radii, shadows } from '@/theme/tokens';

type AppRow = {
  id: string;
  applicant_full_name: string;
  status: string;
  waitlist_rank?: number | null;
  date_of_birth?: string;
};

const STATUSES = ['SUBMITTED', 'EXAM_SCHEDULED', 'WAITLISTED', 'ACCEPTED', 'ENROLLED', 'REJECTED'];

const statusAr: Record<string, string> = {
  SUBMITTED: 'مُقدَّم',
  EXAM_SCHEDULED: 'امتحان مجدول',
  WAITLISTED: 'قائمة انتظار',
  ACCEPTED: 'مقبول',
  ENROLLED: 'مسجّل',
  REJECTED: 'مرفوض',
};

function toneFor(status: string): 'emerald' | 'amber' | 'indigo' | 'rose' | 'slate' {
  if (status === 'ENROLLED' || status === 'ACCEPTED') return 'emerald';
  if (status === 'EXAM_SCHEDULED' || status === 'WAITLISTED') return 'amber';
  if (status === 'REJECTED') return 'rose';
  if (status === 'SUBMITTED') return 'indigo';
  return 'slate';
}

function notify(msg: string) {
  if (Platform.OS === 'web') window.alert(msg);
  else Alert.alert('القبول', msg);
}

export default function AdmissionsPipeline() {
  const { accessToken, user } = useAuth();
  const [rows, setRows] = useState<AppRow[]>([]);
  const [filter, setFilter] = useState<string | undefined>();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [defaultSectionId, setDefaultSectionId] = useState<string | null>(null);

  const headers = {
    token: accessToken || undefined,
    tenantId: user?.tenantId || undefined,
    branchId: user?.branchIds?.[0],
  };

  const load = async () => {
    const path = filter
      ? `/v1/admissions/applications?status=${filter}`
      : '/v1/admissions/applications';
    const data = await apiRequest<AppRow[]>(path, headers);
    setRows(data);
  };

  useEffect(() => {
    void load().catch(() => setRows([]));
    void apiRequest<{ id: string }[]>('/v1/tenants/me/sections', headers)
      .then((sections) => setDefaultSectionId(sections[0]?.id || null))
      .catch(() => setDefaultSectionId(null));
  }, [filter]);

  const run = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    try {
      await action();
      await load();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'فشلت العملية');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>مسار القبول</Text>
      <Text style={styles.sub}>قبول · جدولة امتحان · قبول/انتظار · تسجيل طالب</Text>
      <View style={styles.filters}>
        <Pressable
          onPress={() => setFilter(undefined)}
          style={[styles.chip, !filter && styles.chipActive]}
        >
          <Text style={[styles.chipText, !filter && styles.chipTextActive]}>الكل</Text>
        </Pressable>
        {STATUSES.map((s) => (
          <Pressable
            key={s}
            onPress={() => setFilter(s)}
            style={[styles.chip, filter === s && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === s && styles.chipTextActive]}>
              {statusAr[s] || s}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ gap: 10 }}
        ListEmptyComponent={
          <Text style={styles.empty}>لا طلبات بعد — استخدم نموذج التقديم العام بكود المدرسة</Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, shadows.card]}>
            <View style={styles.rowTop}>
              <Text style={styles.name}>{item.applicant_full_name}</Text>
              <PillBadge
                label={
                  item.waitlist_rank
                    ? `${statusAr[item.status] || item.status} #${item.waitlist_rank}`
                    : statusAr[item.status] || item.status
                }
                tone={toneFor(item.status)}
              />
            </View>
            <Text style={styles.id}>{item.id}</Text>
            <View style={styles.actions}>
              {item.status === 'SUBMITTED' ? (
                <Button
                  size="sm"
                  label="جدولة امتحان"
                  disabled={busyId === item.id}
                  onPress={() =>
                    void run(item.id, async () => {
                      const slot = new Date(Date.now() + 3 * 86400000).toISOString();
                      await apiRequest(`/v1/admissions/applications/${item.id}/schedule-exam`, {
                        method: 'POST',
                        ...headers,
                        body: { entrance_exam_slot: slot },
                      });
                      notify('تم جدولة الامتحان');
                    })
                  }
                />
              ) : null}
              {['SUBMITTED', 'EXAM_SCHEDULED'].includes(item.status) ? (
                <Button
                  size="sm"
                  variant="outline"
                  label="قبول / انتظار"
                  disabled={busyId === item.id}
                  onPress={() =>
                    void run(item.id, async () => {
                      const r = await apiRequest<{ status: string }>(
                        `/v1/admissions/applications/${item.id}/accept`,
                        { method: 'POST', ...headers },
                      );
                      notify(`النتيجة: ${statusAr[r.status] || r.status}`);
                    })
                  }
                />
              ) : null}
              {['ACCEPTED', 'WAITLISTED'].includes(item.status) ? (
                <Button
                  size="sm"
                  label="تسجيل طالب"
                  disabled={busyId === item.id}
                  onPress={() =>
                    void run(item.id, async () => {
                      await apiRequest(`/v1/admissions/applications/${item.id}/enroll`, {
                        method: 'POST',
                        ...headers,
                        body: {
                          section_id: defaultSectionId || undefined,
                          create_parent_account: true,
                          parent_password: 'parent123',
                        },
                      });
                      notify(
                        defaultSectionId
                          ? 'تم تسجيل الطالب في الفصل وربطه بولي الأمر'
                          : 'تم تسجيل الطالب (بدون فصل — شغّل إعداد Phase 1)',
                      );
                    })
                  }
                />
              ) : null}
            </View>
          </View>
        )}
      />
      <Button label="تحديث" onPress={() => void load().catch(() => setRows([]))} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, backgroundColor: colors.bgCanvas, gap: 8 },
  h1: { fontFamily: arFonts.extraBold, fontSize: 26, color: colors.textPrimary, textAlign: 'right' },
  sub: { fontFamily: arFonts.regular, color: colors.textSecondary, marginBottom: 4, textAlign: 'right' },
  filters: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  chip: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipText: { fontFamily: arFonts.semiBold, fontSize: 11, color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    gap: 8,
  },
  rowTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { fontFamily: arFonts.semiBold, fontSize: 15, color: colors.textPrimary, flex: 1, textAlign: 'right' },
  id: { fontFamily: arFonts.mono, fontSize: 11, color: colors.textMuted, textAlign: 'right' },
  actions: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  empty: {
    fontFamily: arFonts.regular,
    color: colors.textMuted,
    paddingVertical: 24,
    textAlign: 'center',
  },
});
