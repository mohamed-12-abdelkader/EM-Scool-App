import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { brand, colors, fonts, radii, shadows } from '@/theme/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const links = [
  { label: 'Home', href: '/(public)' },
  { label: 'Product', href: '/(public)#product' },
  { label: 'K-12 Stages', href: '/(public)#stages' },
  { label: 'Solutions', href: '/(public)#solutions' },
  { label: '2026 Guide', href: '/(public)#guide' },
  { label: 'Pricing', href: '/(public)#pricing' },
];

export function Navbar() {
  const { isDesktop } = useBreakpoint();
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.wrap, shadows.sm]}>
      <View style={styles.inner}>
          <Pressable style={styles.brand} onPress={() => router.push('/(public)' as never)}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>C</Text>
          </View>
          <Text style={styles.wordmark}>{brand.wordmark}</Text>
          <View style={styles.k12}>
            <Text style={styles.k12Text}>{brand.badge}</Text>
          </View>
        </Pressable>

        {isDesktop ? (
          <View style={styles.center}>
            {links.map((l) => (
              <Pressable key={l.label} onPress={() => router.push(l.href as never)}>
                <Text style={styles.link}>{l.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable onPress={() => setOpen((v) => !v)} style={styles.menuBtn}>
            <Text style={styles.menuBtnText}>{open ? 'Close' : 'Menu'}</Text>
          </Pressable>
        )}

        <View style={styles.actions}>
          <Pressable onPress={() => router.push('/(auth)/signin')}>
            <Text style={styles.signIn}>Sign in</Text>
          </Pressable>
          {isDesktop ? (
            <Pressable style={styles.cta} onPress={() => router.push('/(auth)/signin')}>
              <Text style={styles.ctaText}>Get started for Free</Text>
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
                router.push(l.href as never);
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
            <Text style={styles.ctaText}>Get started for Free</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: Platform.OS === 'web' ? ('sticky' as never) : 'relative',
    top: 0,
    zIndex: 50,
    backgroundColor: 'rgba(255,255,255,0.92)',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: { color: '#fff', fontFamily: fonts.extraBold, fontSize: 18 },
  wordmark: { fontFamily: fonts.extraBold, fontSize: 20, color: colors.textPrimary, letterSpacing: -0.5 },
  k12: {
    backgroundColor: colors.brandSoft,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  k12Text: { fontFamily: fonts.semiBold, fontSize: 10, color: colors.brandPrimary },
  center: { flexDirection: 'row', alignItems: 'center', gap: 20, flex: 1, justifyContent: 'center' },
  link: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  signIn: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textSecondary, paddingHorizontal: 8 },
  cta: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.xl,
  },
  ctaText: { color: '#fff', fontFamily: fonts.semiBold, fontSize: 14 },
  menuBtn: { padding: 8 },
  menuBtnText: { fontFamily: fonts.semiBold, color: colors.textPrimary },
  drawer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  drawerLink: { fontFamily: fonts.medium, fontSize: 16, color: colors.textPrimary, paddingVertical: 8 },
});
