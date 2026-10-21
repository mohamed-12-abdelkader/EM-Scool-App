import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { brand, colors, fonts, radii } from '@/theme/tokens';
import { Button } from '@/components/ui';

const integrations = [
  'ZKTeco Biometrics',
  'Hikvision RFID',
  'Barcode / QR',
  'Stripe',
  'Apple / Google Pay',
  'Fawry / Local POS',
  'WhatsApp Business',
  'Expo Push',
  'SMS Gateways',
  'SMTP Email',
];

export function IntegrationsAndFooter() {
  return (
    <View>
      <View style={styles.integrations}>
        <Text style={styles.intTitle}>Integrations ecosystem</Text>
        <View style={styles.badges}>
          {integrations.map((i) => (
            <View key={i} style={styles.badge}>
              <Text style={styles.badgeText}>{i}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.ctaBanner}>
        <Text style={styles.ctaH}>Built for Real Institutions. Designed for Daily Operations.</Text>
        <Text style={styles.ctaP}>
          Scales from a single school to a multi-branch educational group. Fast onboarding. Full data
          migration included.
        </Text>
        <View style={styles.ctaRow}>
          <Button label="Book a Personalized Demo →" size="lg" onPress={() => router.push('/(auth)/signin')} />
          <Button
            label="Sign in to Portal"
            variant="outline"
            size="lg"
            style={{ backgroundColor: 'transparent', borderColor: '#334155' }}
            onPress={() => router.push('/(auth)/signin')}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>
          {brand.wordmark} · {brand.badge}
        </Text>
        <Text style={styles.footerMuted}>
          Universal Multi-Tenant K-12 SIS · LMS · ERP · © {new Date().getFullYear()}
        </Text>
        <Pressable onPress={() => router.push('/(public)/admissions-apply')}>
          <Text style={styles.footerLink}>Online Admissions Application →</Text>
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
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: -0.4,
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
  badgeText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  ctaBanner: {
    backgroundColor: colors.bgDarkCanvas,
    paddingVertical: 72,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
  },
  ctaH: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.8,
    maxWidth: 720,
  },
  ctaP: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
    maxWidth: 560,
    lineHeight: 24,
  },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 },
  footer: {
    backgroundColor: colors.bgDarkCanvas,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  footerBrand: { fontFamily: fonts.bold, color: '#fff', fontSize: 16 },
  footerMuted: { fontFamily: fonts.regular, color: colors.textOnDarkMuted, fontSize: 13 },
  footerLink: { fontFamily: fonts.semiBold, color: '#A5B4FC', fontSize: 14, marginTop: 4 },
});
