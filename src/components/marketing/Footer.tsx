import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { landingAr } from '@/content/landing.ar';
import { arFonts, brand, colors, radii } from '@/theme/tokens';
import { Button } from '@/components/ui';

const t = landingAr.footer;

export function IntegrationsAndFooter() {
  return (
    <View>
      <View style={styles.integrations}>
        <Text style={styles.intTitle}>{t.integrationsTitle}</Text>
        <View style={styles.badges}>
          {t.integrations.map((i) => (
            <View key={i} style={styles.badge}>
              <Text style={styles.badgeText}>{i}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.ctaBanner}>
        <Text style={styles.ctaH}>{t.ctaTitle}</Text>
        <Text style={styles.ctaP}>{t.ctaBody}</Text>
        <View style={styles.ctaRow}>
          <Button label={t.ctaPrimary} size="lg" onPress={() => router.push('/(auth)/signin')} />
          <Button
            label={t.ctaSecondary}
            variant="outline"
            size="lg"
            style={{ backgroundColor: 'transparent', borderColor: '#334155' }}
            onPress={() => router.push('/(public)/admissions-apply')}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>
          {brand.wordmark} · {landingAr.brandBadge}
        </Text>
        <Text style={styles.footerMuted}>
          {t.brandLine} · © {new Date().getFullYear()}
        </Text>
        <Pressable onPress={() => router.push('/(public)/admissions-apply')}>
          <Text style={styles.footerLink}>{t.applyLink}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  integrations: {
    paddingVertical: 64,
    paddingHorizontal: 24,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    gap: 20,
  },
  intTitle: {
    fontFamily: arFonts.bold,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  badge: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: { fontFamily: arFonts.medium, fontSize: 13, color: colors.textSecondary },
  ctaBanner: {
    backgroundColor: colors.bgDarkCanvas,
    paddingVertical: 72,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
  },
  ctaH: {
    fontFamily: arFonts.extraBold,
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    maxWidth: 720,
    lineHeight: 40,
  },
  ctaP: {
    fontFamily: arFonts.regular,
    fontSize: 15,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
    maxWidth: 640,
    lineHeight: 26,
  },
  ctaRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 },
  footer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  footerBrand: { fontFamily: arFonts.bold, fontSize: 16, color: colors.textPrimary },
  footerMuted: { fontFamily: arFonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  footerLink: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.brandPrimary, marginTop: 4 },
});
