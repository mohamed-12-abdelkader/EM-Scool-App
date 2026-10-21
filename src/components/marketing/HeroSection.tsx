import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui';
import { PillBadge } from './Badge';
import { colors, fonts } from '@/theme/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const metrics = [
  { value: '6+', label: 'Attendance methods (Biometric, RFID, QR, NFC, Roll Call, Kiosk)' },
  { value: '3×', label: 'Faster fee collection with automated WhatsApp & Push reminders' },
  { value: '40%', label: 'Less weekly administrative workload across branches' },
  { value: '100%', label: 'Parent real-time visibility across KG → Secondary' },
];

export function HeroSection() {
  const { isDesktop } = useBreakpoint();

  return (
    <View style={styles.wrap}>
      <View style={styles.inner}>
        <PillBadge label="✦ The Unified Operating System for K–12 Schools & Multi-Branch Groups" tone="indigo" />
        <Text style={[styles.h1, isDesktop && { fontSize: 52, lineHeight: 58 }]}>
          Stop managing your school with spreadsheets and WhatsApp groups.
        </Text>
        <Text style={styles.sub}>
          An all-in-one multi-tenant School Management System (SIS, LMS & ERP) for Kindergarten,
          Elementary, Preparatory, and Secondary schools. Admissions, biometric/RFID attendance,
          conflict-free timetables, multi-scale grading, online fees, HR payroll, and live bus GPS —
          connected in one platform.
        </Text>
        <View style={styles.ctaRow}>
          <Button label="Book a free demo →" size="lg" onPress={() => router.push('/(auth)/signin')} />
          <Button
            label="Sign in to Portal"
            variant="outline"
            size="lg"
            onPress={() => router.push('/(auth)/signin')}
          />
        </View>
        <Text style={styles.trust}>
          ✓ Scales from 50 to 50,000 students · ✓ Multi-Branch Ready · ✓ No credit card required
        </Text>
      </View>

      <View style={[styles.metrics, isDesktop && styles.metricsDesktop]}>
        {metrics.map((m) => (
          <View key={m.value} style={styles.metric}>
            <Text style={styles.metricValue}>{m.value}</Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: colors.bgCanvas,
  },
  inner: {
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 18,
  },
  h1: {
    fontFamily: fonts.extraBold,
    fontSize: 36,
    lineHeight: 42,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -1.2,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 28,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 720,
  },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 4 },
  trust: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  metrics: {
    marginTop: 40,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    gap: 12,
  },
  metricsDesktop: { flexDirection: 'row' },
  metric: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 16,
    padding: 18,
    gap: 6,
  },
  metricValue: {
    fontFamily: fonts.monoMedium,
    fontSize: 28,
    color: colors.brandPrimary,
    fontVariant: ['tabular-nums'],
  },
  metricLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});
