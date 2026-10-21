import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Button } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { colors, fonts, radii, shadows } from '@/theme/tokens';

type Child = { id: string; full_name: string; student_code: string };

export default function ParentHome() {
  const { accessToken, user, activeChildId, setActiveChildId, logout } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    void apiRequest<Child[]>('/v1/sis/parent/children', {
      token: accessToken || undefined,
      tenantId: user?.tenantId || undefined,
    })
      .then((rows) => {
        setChildren(rows);
        if (!activeChildId && rows[0]) setActiveChildId(rows[0].id);
      })
      .catch(() => setChildren([]));
  }, []);

  const active = children.find((c) => c.id === activeChildId) || children[0];

  return (
    <View style={styles.wrap}>
      <PillBadge label="Scope: Linked Family Group" tone="indigo" />
      <Text style={styles.h1}>Parent portal</Text>
      <Text style={styles.section}>Multi-child switcher</Text>
      <FlatList
        horizontal
        data={children}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ gap: 8 }}
        ListEmptyComponent={<Text style={styles.meta}>No linked children yet</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setActiveChildId(item.id)}
            style={[styles.chip, activeChildId === item.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeChildId === item.id && { color: '#fff' }]}>
              {item.full_name}
            </Text>
          </Pressable>
        )}
      />
      {active ? (
        <View style={[styles.card, shadows.card]}>
          <Text style={styles.name}>{active.full_name}</Text>
          <Text style={styles.mono}>{active.student_code}</Text>
          <View style={styles.alerts}>
            <Text style={styles.alert}>✅ Attendance alerts appear here in real time</Text>
            <Text style={styles.alert}>🏥 Clinic visit notifications feed</Text>
            <Text style={styles.alert}>🚌 Bus proximity (Phase 4)</Text>
          </View>
        </View>
      ) : null}
      <Button label="Sign out" variant="ghost" onPress={() => void logout()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 12, backgroundColor: colors.bgCanvas },
  h1: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.textPrimary, letterSpacing: -0.6 },
  section: { fontFamily: fonts.bold, fontSize: 14, color: colors.textPrimary },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  chipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipText: { fontFamily: fonts.semiBold, color: colors.textPrimary },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    gap: 8,
  },
  name: { fontFamily: fonts.bold, fontSize: 18, color: colors.textPrimary },
  mono: { fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted },
  alerts: { gap: 6, marginTop: 8 },
  alert: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  meta: { fontFamily: fonts.regular, color: colors.textMuted },
});
