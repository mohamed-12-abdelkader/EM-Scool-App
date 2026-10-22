import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { landingAr } from '@/content/landing.ar';
import { useLandingScroll } from './LandingScroll';
import { arFonts, brand, colors, radii, shadows } from '@/theme/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const t = landingAr.nav;

type NavItem = { label: string; section: string };

const links: NavItem[] = [
  { label: t.home, section: 'top' },
  { label: t.product, section: 'product' },
  { label: t.stages, section: 'stages' },
  { label: t.solutions, section: 'solutions' },
  { label: t.guide, section: 'guide' },
  { label: t.pricing, section: 'pricing' },
];

export function Navbar() {
  const { isDesktop } = useBreakpoint();
  const { scrollTo } = useLandingScroll();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const goNav = (section: string) => {
    const onLanding =
      !pathname ||
      pathname === '/' ||
      pathname === '/(public)' ||
      pathname.endsWith('(public)') ||
      pathname === '/index';
    if (!onLanding || pathname.includes('admissions')) {
      router.push({ pathname: '/(public)', params: { section } } as never);
      return;
    }
    scrollTo(section);
  };

  return (
    <View style={[styles.wrap, shadows.sm]}>
      <View style={styles.inner}>
        <Pressable style={styles.brand} onPress={() => goNav('top')}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>C</Text>
          </View>
          <Text style={styles.wordmark}>{brand.wordmark}</Text>
          <View style={styles.k12}>
            <Text style={styles.k12Text}>{landingAr.brandBadge}</Text>
          </View>
        </Pressable>

        {isDesktop ? (
          <View style={styles.center}>
            {links.map((l) => (
              <Pressable
                key={l.label}
                accessibilityRole="link"
                onPress={() => goNav(l.section)}
                style={({ hovered, pressed }) => [
                  styles.linkHit,
                  (hovered || pressed) && styles.linkHitActive,
                ]}
              >
                <Text style={styles.link}>{l.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable onPress={() => setOpen((v) => !v)} style={styles.menuBtn}>
            <Text style={styles.menuBtnText}>{open ? t.close : t.menu}</Text>
          </Pressable>
        )}

        <View style={styles.actions}>
          <Pressable onPress={() => router.push('/(auth)/signin')}>
            <Text style={styles.signIn}>{t.signIn}</Text>
          </Pressable>
          {isDesktop ? (
            <Pressable style={styles.cta} onPress={() => router.push('/(auth)/signin')}>
              <Text style={styles.ctaText}>{t.getStarted}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {!isDesktop && open ? (
        <View style={styles.drawer}>
          {links.map((l) => (
            <Pressable
              key={l.label}
              onPress={() => {
                setOpen(false);
                goNav(l.section);
              }}
            >
              <Text style={styles.drawerLink}>{l.label}</Text>
            </Pressable>
          ))}
          <Pressable
            style={styles.cta}
            onPress={() => {
              setOpen(false);
              router.push('/(auth)/signin');
            }}
          >
            <Text style={styles.ctaText}>{t.getStarted}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    zIndex: 50,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226,232,240,0.8)',
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(12px)' } as object) : {}),
  },
  inner: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    height: 72,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  brand: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: { color: '#fff', fontFamily: arFonts.extraBold, fontSize: 18 },
  wordmark: { fontFamily: arFonts.extraBold, fontSize: 20, color: colors.textPrimary },
  k12: {
    backgroundColor: colors.brandSoft,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  k12Text: { fontFamily: arFonts.semiBold, fontSize: 10, color: colors.brandPrimary },
  center: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  linkHit: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : {}),
  },
  linkHitActive: {
    backgroundColor: colors.brandSoft,
  },
  link: { fontFamily: arFonts.medium, fontSize: 14, color: colors.textSecondary },
  actions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  signIn: { fontFamily: arFonts.semiBold, fontSize: 14, color: colors.textSecondary, paddingHorizontal: 8 },
  cta: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.xl,
  },
  ctaText: { color: '#fff', fontFamily: arFonts.semiBold, fontSize: 14 },
  menuBtn: { padding: 8 },
  menuBtnText: { fontFamily: arFonts.semiBold, color: colors.textPrimary },
  drawer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    alignItems: 'stretch',
  },
  drawerLink: {
    fontFamily: arFonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 8,
    textAlign: 'right',
  },
});
