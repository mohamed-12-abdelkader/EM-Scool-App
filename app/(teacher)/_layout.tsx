import type { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LivePulseDot } from '@/components/ui/LivePulseDot';
import { useAuth } from '@/lib/auth';
import { arFonts, brand, colors, radii, spacing } from '@/theme/tokens';

function TeacherChrome({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const onAttendance = pathname.includes('attendance');

  return (
    <View style={[styles.chrome, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <View style={styles.topBarInner}>
          <View style={styles.brandBlock}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>C</Text>
            </View>
            <View>
              <Text style={styles.brandName}>{brand.wordmark}</Text>
              <Text style={styles.brandRole}>لوحة المعلم</Text>
            </View>
          </View>
          <View style={styles.topActions}>
            {onAttendance ? (
              <AnimatedPressable
                onPress={() => router.replace('/(teacher)' as never)}
                style={styles.navChip}
              >
                <Text style={styles.navChipText}>الرئيسية</Text>
              </AnimatedPressable>
            ) : null}
            <View style={styles.userChip}>
              <LivePulseDot size={8} color={colors.statusSuccess} />
              <Text style={styles.userChipText} numberOfLines={1}>
                {user?.full_name ?? 'معلم'}
              </Text>
            </View>
            <AnimatedPressable
              accessibilityLabel="تسجيل الخروج"
              onPress={() => {
                void (async () => {
                  await logout();
                  router.replace('/(auth)/signin' as never);
                })();
              }}
              style={styles.logoutBtn}
            >
              <Text style={styles.logoutText}>خروج</Text>
            </AnimatedPressable>
          </View>
        </View>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

export default function TeacherLayout() {
  return (
    <TeacherChrome>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgCanvas } }} />
    </TeacherChrome>
  );
}

const styles = StyleSheet.create({
  chrome: { flex: 1, backgroundColor: colors.bgCanvas },
  topBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  topBarInner: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  brandBlock: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.statusSuccess,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: { fontFamily: arFonts.bold, color: '#fff', fontSize: 16 },
  brandName: { fontFamily: arFonts.bold, fontSize: 16, color: colors.textPrimary, textAlign: 'right' },
  brandRole: { fontFamily: arFonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  topActions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  navChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.brandSoft,
  },
  navChipText: { fontFamily: arFonts.semiBold, fontSize: 12, color: colors.brandPrimary },
  userChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    maxWidth: 200,
  },
  userChipText: { fontFamily: arFonts.medium, fontSize: 12, color: colors.textPrimary },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
  },
  logoutText: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textSecondary },
  body: { flex: 1 },
});
