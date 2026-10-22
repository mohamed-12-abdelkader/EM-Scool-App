import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { arFonts, colors, radii, shadows, spacing } from '@/theme/tokens';
import { Icon } from '@/components/ui';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

const tabs = [
  { label: 'الرئيسية', href: '/', icon: 'LayoutDashboard' as const },
  { label: 'الرسوم', href: '/finance', icon: 'Wallet' as const },
  { label: 'الجدول', href: '/timetable', icon: 'CalendarClock' as const },
  { label: 'الطلاب', href: '/students', icon: 'GraduationCap' as const },
  { label: 'المزيد', href: '__more__', icon: 'Menu' as const },
];

interface MobileTabBarProps {
  onOpenMore?: () => void;
}

export function MobileTabBar({ onOpenMore }: MobileTabBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const active =
          tab.href === '/'
            ? pathname === '/' || pathname === ''
            : tab.href === '__more__'
              ? false
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <AnimatedPressable
            key={tab.href}
            style={styles.tab}
            onPress={() => {
              if (tab.href === '__more__') {
                onOpenMore?.();
                return;
              }
              router.push(tab.href as never);
            }}
            accessibilityLabel={tab.label}
          >
            <View style={[styles.iconWrap, active && styles.iconActive]}>
              <Icon
                name={tab.icon}
                size={20}
                color={active ? colors.brandPrimary : colors.textMuted}
              />
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: spacing.sm,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    minHeight: 52,
    justifyContent: 'center',
  },
  iconWrap: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  iconActive: {
    backgroundColor: colors.brandSoft,
  },
  label: {
    fontFamily: arFonts.medium,
    fontSize: 11,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.brandPrimary,
    fontFamily: arFonts.semiBold,
  },
});
