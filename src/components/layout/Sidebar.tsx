import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { arFonts, brand, colors, radii, spacing } from '@/theme/tokens';
import { navGroups } from '@/navigation/navConfig';
import { Avatar, Icon } from '@/components/ui';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuth } from '@/lib/auth';

interface SidebarProps {
  collapsed?: boolean;
  forceExpanded?: boolean;
  onNavigate?: () => void;
  variant?: 'desktop' | 'drawer';
}

export function Sidebar({
  collapsed,
  forceExpanded,
  onNavigate,
  variant = 'desktop',
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { isDesktop } = useBreakpoint();
  const isDrawer = variant === 'drawer' || forceExpanded;
  const showLabels = isDrawer || (!collapsed && isDesktop);
  const [query, setQuery] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.map((g, i) => [g.title, i === 0])),
  );

  const activeHref = useMemo(() => {
    if (pathname === '/' || pathname === '') return '/';
    return pathname;
  }, [pathname]);

  const filteredGroups = useMemo(() => {
    const q = query.trim();
    if (!q) return navGroups;
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => item.label.includes(q) || group.title.includes(q),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [query]);

  const displayName = user?.full_name || 'مدير المدرسة';

  return (
    <View
      style={[
        styles.sidebar,
        showLabels ? styles.expanded : styles.collapsed,
        isDrawer && styles.drawerSidebar,
      ]}
    >
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>C</Text>
        </View>
        {showLabels ? (
          <View style={styles.brandText}>
            <Text style={styles.brandTitle}>{brand.wordmark}</Text>
            <Text style={styles.brandSub}>إدارة المدرسة</Text>
          </View>
        ) : null}
      </View>

      {showLabels ? (
        <View style={styles.searchBox}>
          <View style={styles.searchField}>
            <Icon name="Search" size={15} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="بحث سريع..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
          </View>
        </View>
      ) : null}

      <ScrollView
        style={styles.nav}
        contentContainerStyle={styles.navContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredGroups.map((group) => {
          const open = query ? true : (openGroups[group.title] ?? false);
          return (
            <View key={group.title} style={styles.group}>
              {showLabels ? (
                <AnimatedPressable
                  onPress={() =>
                    setOpenGroups((prev) => ({ ...prev, [group.title]: !prev[group.title] }))
                  }
                  style={styles.groupHeader}
                >
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  <Icon
                    name={open ? 'ChevronDown' : 'ChevronLeft'}
                    size={14}
                    color={colors.textMuted}
                  />
                </AnimatedPressable>
              ) : null}

              {(showLabels ? open : true) &&
                group.items.map((item) => {
                  const active =
                    item.href === '/'
                      ? activeHref === '/'
                      : activeHref === item.href || activeHref.startsWith(`${item.href}/`);
                  return (
                    <AnimatedPressable
                      key={item.href}
                      onPress={() => {
                        router.push(item.href as never);
                        onNavigate?.();
                      }}
                      style={[
                        styles.item,
                        active && styles.itemActive,
                        !showLabels && styles.itemIconOnly,
                      ]}
                    >
                      <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                        <Icon
                          name={item.icon}
                          size={17}
                          color={active ? colors.brandPrimary : colors.textMuted}
                        />
                      </View>
                      {showLabels ? (
                        <Text
                          style={[styles.itemLabel, active && styles.itemLabelActive]}
                          numberOfLines={1}
                        >
                          {item.label}
                        </Text>
                      ) : null}
                    </AnimatedPressable>
                  );
                })}
            </View>
          );
        })}
      </ScrollView>

      {showLabels ? (
        <View style={styles.footer}>
          <Avatar name={displayName} color={colors.brandPrimary} size={36} />
          <View style={styles.footerText}>
            <Text style={styles.footerName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.footerRole} numberOfLines={1}>
              متّصل الآن
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: colors.bgSurface,
    borderLeftWidth: 1,
    borderLeftColor: colors.borderSubtle,
    height: '100%',
  },
  drawerSidebar: {
    borderLeftWidth: 0,
    flex: 1,
  },
  expanded: { width: '100%' },
  collapsed: { width: '100%' },
  brand: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontFamily: arFonts.bold,
    fontSize: 18,
  },
  brandText: { flex: 1, minWidth: 0 },
  brandTitle: {
    color: colors.textPrimary,
    fontFamily: arFonts.bold,
    fontSize: 17,
    textAlign: 'right',
  },
  brandSub: {
    color: colors.textMuted,
    fontFamily: arFonts.regular,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 2,
  },
  searchBox: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchField: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgCanvas,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: arFonts.regular,
    fontSize: 13,
    textAlign: 'right',
    paddingVertical: spacing.sm,
  },
  nav: { flex: 1 },
  navContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['2xl'],
    gap: 2,
  },
  group: { marginBottom: spacing.sm },
  groupHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: 2,
  },
  groupTitle: {
    color: colors.textMuted,
    fontFamily: arFonts.semiBold,
    fontSize: 11,
    textAlign: 'right',
  },
  item: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    marginBottom: 2,
    minHeight: 44,
  },
  itemIconOnly: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  itemActive: {
    backgroundColor: colors.brandSoft,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCanvas,
  },
  iconWrapActive: {
    backgroundColor: '#fff',
  },
  itemLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: arFonts.medium,
    fontSize: 13.5,
    textAlign: 'right',
  },
  itemLabelActive: {
    color: colors.brandPrimary,
    fontFamily: arFonts.semiBold,
  },
  footer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.bgCanvas,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  footerText: { flex: 1, minWidth: 0 },
  footerName: {
    color: colors.textPrimary,
    fontFamily: arFonts.semiBold,
    fontSize: 13,
    textAlign: 'right',
  },
  footerRole: {
    color: colors.statusSuccess,
    fontFamily: arFonts.regular,
    fontSize: 11,
    textAlign: 'right',
  },
});
