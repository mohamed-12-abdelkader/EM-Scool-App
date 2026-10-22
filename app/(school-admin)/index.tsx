import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { useAuth } from '@/lib/auth';
import { arFonts, colors, radii, shadows } from '@/theme/tokens';

export default function SchoolAdminHome() {
  const { user, logout } = useAuth();
  return (
    <View style={styles.wrap}>
      <PillBadge label="نطاق: إدارة المدرسة / الفرع" tone="violet" />
      <Text style={styles.h1}>لوحة إدارة المدرسة</Text>
      <Text style={styles.sub}>
        {user?.full_name} · {user?.role}
      </Text>
      <View style={[styles.card, shadows.card]}>
        <Text style={styles.cardLabel}>معرّف المستأجر</Text>
        <Text style={styles.mono}>{user?.tenantId || '—'}</Text>
      </View>
      <Button label="مسار القبول" onPress={() => router.push('/(school-admin)/admissions')} />
      <Button
        label="دليل الطلاب (ملف 360°)"
        variant="outline"
        onPress={() => router.push('/(school-admin)/students')}
      />
      <Button label="تسجيل الخروج" variant="ghost" onPress={() => void logout()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 12, backgroundColor: colors.bgCanvas },
  h1: { fontFamily: arFonts.extraBold, fontSize: 28, color: colors.textPrimary, textAlign: 'right' },
  sub: { fontFamily: arFonts.regular, color: colors.textSecondary, textAlign: 'right' },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    gap: 6,
  },
  cardLabel: { fontFamily: arFonts.medium, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  mono: { fontFamily: arFonts.mono, fontSize: 12, color: colors.textPrimary, textAlign: 'right' },
});
