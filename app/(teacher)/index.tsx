import { router } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui';
import { PillBadge } from '@/components/marketing';
import { useAuth } from '@/lib/auth';
import { arFonts, colors } from '@/theme/tokens';

export default function TeacherHome() {
  const { logout, user } = useAuth();
  return (
    <View style={styles.wrap}>
      <PillBadge label="نطاق: المعلم" tone="emerald" />
      <Text style={styles.h1}>لوحة المعلم</Text>
      <Text style={styles.sub}>{user?.full_name} · {user?.role}</Text>
      <Button label="حضور الفصل (يعمل بدون إنترنت)" onPress={() => router.push('/(teacher)/attendance')} />
      <Button label="تسجيل الخروج" variant="ghost" onPress={() => void logout()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 12, backgroundColor: colors.bgCanvas },
  h1: { fontFamily: arFonts.extraBold, fontSize: 28, color: colors.textPrimary, textAlign: 'right' },
  sub: { fontFamily: arFonts.regular, color: colors.textSecondary, textAlign: 'right' },
});
