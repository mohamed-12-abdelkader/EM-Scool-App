import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Button } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { colors, fonts, radii, shadows } from '@/theme/tokens';

type Tenant = { id: string; name: string; slug: string; is_active: boolean; quota_max_students?: number };

export default function SuperAdminHome() {
  const { accessToken, logout, user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const rows = await apiRequest<Tenant[]>('/v1/tenants', { token: accessToken || undefined });
      setTenants(rows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>PLATFORM SUPER ADMIN</Text>
      <Text style={styles.h1}>Tenant control plane</Text>
      <Text style={styles.sub}>{user?.full_name} · Cross-tenant SaaS scope</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={tenants}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ gap: 10, paddingVertical: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.card, shadows.card]}>
            <View style={styles.cardTop}>
              <Text style={styles.name}>{item.name}</Text>
              <PillBadge label={item.is_active ? 'Active' : 'Inactive'} tone={item.is_active ? 'emerald' : 'rose'} />
            </View>
            <Text style={styles.slug}>{item.slug}</Text>
            <Text style={styles.meta}>
              Quota{' '}
              <Text style={styles.mono}>{item.quota_max_students ?? '—'}</Text> students
            </Text>
          </View>
        )}
      />
      <Button label="Refresh tenants" onPress={load} />
      <Button label="Sign out" variant="ghost" onPress={() => void logout()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 8, backgroundColor: colors.bgCanvas },
  kicker: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.brandPrimary, letterSpacing: 1 },
  h1: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.textPrimary, letterSpacing: -0.6 },
  sub: { fontFamily: fonts.regular, color: colors.textSecondary, marginBottom: 4 },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    gap: 6,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.textPrimary },
  slug: { fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  mono: { fontFamily: fonts.monoMedium, fontVariant: ['tabular-nums'] },
  error: { color: colors.statusDanger, fontFamily: fonts.medium },
});
