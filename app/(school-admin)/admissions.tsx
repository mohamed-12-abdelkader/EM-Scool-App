import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Button } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { colors, fonts, radii, shadows } from '@/theme/tokens';

type AppRow = {
  id: string;
  applicant_full_name: string;
  status: string;
  waitlist_rank?: number | null;
};

const STATUSES = ['SUBMITTED', 'EXAM_SCHEDULED', 'WAITLISTED', 'ACCEPTED', 'ENROLLED', 'REJECTED'];

function toneFor(status: string): 'emerald' | 'amber' | 'indigo' | 'rose' | 'slate' {
  if (status === 'ENROLLED' || status === 'ACCEPTED') return 'emerald';
  if (status === 'EXAM_SCHEDULED' || status === 'WAITLISTED') return 'amber';
  if (status === 'REJECTED') return 'rose';
  if (status === 'SUBMITTED') return 'indigo';
  return 'slate';
}

export default function AdmissionsPipeline() {
  const { accessToken, user } = useAuth();
  const [rows, setRows] = useState<AppRow[]>([]);
  const [filter, setFilter] = useState<string | undefined>();

  const load = async () => {
    const path = filter ? `/v1/admissions/applications?status=${filter}` : '/v1/admissions/applications';
    const data = await apiRequest<AppRow[]>(path, {
      token: accessToken || undefined,
      tenantId: user?.tenantId || undefined,
      branchId: user?.branchIds?.[0],
    });
    setRows(data);
  };

  useEffect(() => {
    void load().catch(() => setRows([]));
  }, [filter]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Admissions Pipeline</Text>
      <Text style={styles.sub}>Live Kanban-style status filter · Academic Year cycle</Text>
      <View style={styles.filters}>
        <Pressable onPress={() => setFilter(undefined)} style={[styles.chip, !filter && styles.chipActive]}>
          <Text style={[styles.chipText, !filter && styles.chipTextActive]}>All</Text>
        </Pressable>
        {STATUSES.map((s) => (
          <Pressable
            key={s}
            onPress={() => setFilter(s)}
            style={[styles.chip, filter === s && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === s && styles.chipTextActive]}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ gap: 10 }}
        ListEmptyComponent={<Text style={styles.empty}>No applications yet — try public apply form.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, shadows.card]}>
            <View style={styles.rowTop}>
              <Text style={styles.name}>{item.applicant_full_name}</Text>
              <PillBadge
                label={
                  item.waitlist_rank ? `${item.status} #${item.waitlist_rank}` : item.status
                }
                tone={toneFor(item.status)}
              />
            </View>
            <Text style={styles.id}>{item.id}</Text>
          </View>
        )}
      />
      <Button label="Refresh" onPress={() => void load()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, backgroundColor: colors.bgCanvas, gap: 8 },
  h1: { fontFamily: fonts.extraBold, fontSize: 26, color: colors.textPrimary, letterSpacing: -0.5 },
  sub: { fontFamily: fonts.regular, color: colors.textSecondary, marginBottom: 4 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipText: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 14,
    gap: 6,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textPrimary, flex: 1 },
  id: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted },
  empty: { fontFamily: fonts.regular, color: colors.textMuted, paddingVertical: 24, textAlign: 'center' },
});
