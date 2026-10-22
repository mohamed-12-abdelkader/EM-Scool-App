import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { arFonts, brand, colors, radii, shadows, spacing } from '@/theme/tokens';
import { academicYears } from '@/navigation/navConfig';
import { Avatar, Icon } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuth } from '@/lib/auth';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenMobileNav: () => void;
}

const roleLabel: Record<string, string> = {
  SCHOOL_ADMIN: 'مدير المدرسة',
  FINANCE_MANAGER: 'مدير المالية',
  ACADEMIC_COORDINATOR: 'منسق أكاديمي',
  ADMISSIONS_OFFICER: 'مسؤول القبول',
  GROUP_EXECUTIVE: 'إدارة المجموعة',
};

export function Header({ onToggleSidebar, onOpenMobileNav }: HeaderProps) {
  const { isMobile, isCompact } = useBreakpoint();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [year, setYear] = useState(academicYears[0]);
  const [yearOpen, setYearOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = user?.full_name || 'مستخدم النظام';
  const displayRole = (user?.role && roleLabel[user.role]) || 'إدارة المدرسة';

  return (
    <View style={[styles.header, isMobile && styles.headerMobile]}>
      <View style={styles.right}>
        <Pressable
          onPress={isCompact ? onOpenMobileNav : onToggleSidebar}
          style={styles.iconBtn}
          hitSlop={8}
          accessibilityLabel="القائمة"
        >
          <Icon name="Menu" size={20} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.brandBlock}>
          <Text style={styles.brand}>{brand.wordmark}</Text>
          {!isMobile ? (
            <Text style={styles.greeting} numberOfLines={1}>
              مرحباً، {displayName.split(' ')[0]}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.left}>
        {!isMobile ? (
          <View>
            <Pressable onPress={() => setYearOpen((v) => !v)} style={styles.yearBtn}>
              <Text style={styles.yearText}>{year}</Text>
              <Icon name="ChevronDown" size={14} color={colors.textMuted} />
            </Pressable>
            {yearOpen ? (
              <View style={styles.dropdown}>
                {academicYears.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setYear(item);
                      setYearOpen(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text style={styles.dropdownText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        <View>
          <Pressable onPress={() => setProfileOpen((v) => !v)} style={styles.profile}>
            <Avatar name={displayName} color={colors.brandPrimary} size={isMobile ? 34 : 36} />
            {!isMobile ? (
              <View>
                <Text style={styles.userName}>{displayName}</Text>
                <Text style={styles.userRole}>{displayRole}</Text>
              </View>
            ) : null}
          </Pressable>
          {profileOpen ? (
            <View style={[styles.dropdown, styles.profileMenu]}>
              <Pressable
                onPress={() => {
                  setProfileOpen(false);
                  router.push('/settings');
                }}
              >
                <Text style={styles.dropdownText}>الإعدادات</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setProfileOpen(false);
                  void (async () => {
                    await logout();
                    router.replace('/(auth)/signin' as never);
                  })();
                }}
              >
                <Text style={[styles.dropdownText, { color: colors.statusDanger }]}>تسجيل الخروج</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    zIndex: 20,
  },
  headerMobile: {
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  right: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  left: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandBlock: { gap: 2, flex: 1, minWidth: 0 },
  brand: {
    fontFamily: arFonts.bold,
    fontSize: 18,
    color: colors.brandPrimary,
    textAlign: 'right',
  },
  greeting: {
    fontFamily: arFonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSurface,
  },
  yearBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    height: 36,
    backgroundColor: colors.bgCanvas,
  },
  yearText: {
    fontFamily: arFonts.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  dropdown: {
    position: 'absolute',
    top: 44,
    right: 0,
    minWidth: 160,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.sm,
    ...shadows.md,
    zIndex: 50,
  },
  profileMenu: {
    left: 0,
    right: undefined,
    minWidth: 180,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
  },
  dropdownText: {
    fontFamily: arFonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'right',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  profile: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 4,
  },
  userName: {
    fontFamily: arFonts.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  userRole: {
    fontFamily: arFonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
  },
});
