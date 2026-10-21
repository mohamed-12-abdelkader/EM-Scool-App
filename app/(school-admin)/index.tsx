import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { useAuth } from '@/lib/auth';
import { colors, fonts, radii, shadows } from '@/theme/tokens';

export default function SchoolAdminHome() {
  const { user, logout } = useAuth();
  return (
    <View style={styles.wrap}>
      <PillBadge label="Scope: Branch / Cross-Branch" tone="violet" />
      <Text style={styles.h1}>School Admin</Text>
      <Text style={styles.sub}>{user?.full_name} · {user?.role}</Text>
      <View style={[styles.card, shadows.card]}>
        <Text style={styles.cardLabel}>Tenant</Text>
        <Text style={styles.mono}>{user?.tenantId || '—'}</Text>
      </View>
      <Button label="Open Admissions Pipeline" onPress={() => router.push('/(school-admin)/admissions')} />
      <Button label="Student 360° directory" variant="outline" onPress={() => router.push('/(school-admin)/students')} />
      <Button label="Sign out" variant="ghost" onPress={() => void logout()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 12, backgroundColor: colors.bgCanvas },
  h1: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.textPrimary, letterSpacing: -0.6 },
  sub: { fontFamily: fonts.regular, color: colors.textSecondary },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    gap: 6,
  },
  cardLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  mono: { fontFamily: fonts.mono, fontSize: 12, color: colors.textPrimary },
});
