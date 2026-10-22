import type { ReactNode } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Tabs, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { LivePulseDot } from '@/components/ui/LivePulseDot';
import { useAuth } from '@/lib/auth';
import { arFonts, brand, colors, radii, spacing } from '@/theme/tokens';

function SchoolAdminChrome({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

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
              <Text style={styles.brandRole}>إدارة المدرسة</Text>
            </View>
          </View>
          <View style={styles.topActions}>
            <View style={styles.userChip}>
              <LivePulseDot size={8} color={colors.statusSuccess} />
              <Text style={styles.userChipText} numberOfLines={1}>
                {user?.full_name ?? 'مدير المدرسة'}
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

function TabItem({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.tabItem, active && styles.tabItemActive]}
      accessibilityLabel={label}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </AnimatedPressable>
  );
}

export default function SchoolAdminLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SchoolAdminChrome>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            left: spacing.lg,
            right: spacing.lg,
            bottom: Math.max(insets.bottom, 12),
            height: 64,
            borderRadius: radii['2xl'],
            backgroundColor: colors.bgSurface,
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            paddingBottom: 0,
            elevation: 8,
            shadowColor: '#0F172A',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 20,
            ...(Platform.OS === 'web' ? { maxWidth: 520, alignSelf: 'center', marginHorizontal: 'auto' } : {}),
          },
          tabBarActiveTintColor: colors.brandPrimary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontFamily: arFonts.semiBold,
            fontSize: 13,
            marginBottom: 8,
          },
          tabBarItemStyle: { paddingTop: 8 },
        }}
        tabBar={({ state, navigation }) => (
          <View
            style={[
              styles.floatingBar,
              {
                bottom: Math.max(insets.bottom, 12),
                paddingBottom: Platform.OS === 'web' ? 0 : 0,
              },
            ]}
          >
            {state.routes
              .filter((r) => r.name !== 'student/[id]')
              .map((route) => {
                const focused = state.routes[state.index]?.key === route.key;
                const labels: Record<string, string> = {
                  index: 'الرئيسية',
                  admissions: 'القبول',
                  students: 'الطلاب',
                };
                return (
                  <TabItem
                    key={route.key}
                    label={labels[route.name] || route.name}
                    active={focused}
                    onPress={() => {
                      const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                      });
                      if (!focused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                      }
                    }}
                  />
                );
              })}
          </View>
        )}
      >
        <Tabs.Screen name="index" options={{ title: 'الرئيسية' }} />
        <Tabs.Screen name="admissions" options={{ title: 'القبول' }} />
        <Tabs.Screen name="students" options={{ title: 'الطلاب' }} />
        <Tabs.Screen name="student/[id]" options={{ href: null, title: 'ملف الطالب' }} />
      </Tabs>
    </SchoolAdminChrome>
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
    maxWidth: 1100,
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
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: { fontFamily: arFonts.bold, color: '#fff', fontSize: 16 },
  brandName: { fontFamily: arFonts.bold, fontSize: 16, color: colors.textPrimary, textAlign: 'right' },
  brandRole: { fontFamily: arFonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  topActions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  userChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brandSoft,
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

  floatingBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    height: 64,
    borderRadius: radii['2xl'],
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    maxWidth: 520,
    alignSelf: 'center',
    marginHorizontal: 'auto',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radii.xl,
    marginHorizontal: 4,
  },
  tabItemActive: { backgroundColor: colors.brandSoft },
  tabLabel: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textMuted },
  tabLabelActive: { color: colors.brandPrimary },
});
