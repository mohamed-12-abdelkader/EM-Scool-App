import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { Button } from '@/components/ui';
import { PillBadge } from './Badge';
import { landingAr } from '@/content/landing.ar';
import { arFonts, colors, MOTION } from '@/theme/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const t = landingAr.hero;

function enter(delay: number, reduced: boolean | null | undefined) {
  if (reduced) return undefined;
  return FadeInDown.delay(delay).duration(500).springify();
}

export function HeroSection() {
  const { isDesktop } = useBreakpoint();
  const reduced = useReducedMotion();
  const [d0, d1, d2, d3, d4] = MOTION.heroStaggerMs;

  return (
    <View style={styles.wrap}>
      <View style={styles.inner}>
        <Animated.View entering={enter(d0, reduced)}>
          <PillBadge label={t.eyebrow} tone="indigo" />
        </Animated.View>
        <Animated.View entering={enter(d1, reduced)}>
          <Text style={[styles.h1, isDesktop && { fontSize: 44, lineHeight: 56 }]}>{t.title}</Text>
        </Animated.View>
        <Animated.View entering={enter(d2, reduced)}>
          <Text style={styles.sub}>{t.subtitle}</Text>
        </Animated.View>
        <Animated.View entering={enter(d3, reduced)} style={styles.ctaRow}>
          <Button label={t.ctaPrimary} size="lg" onPress={() => router.push('/(auth)/signin')} />
          <Button
            label={t.ctaSecondary}
            variant="outline"
            size="lg"
            onPress={() => router.push('/(public)/admissions-apply')}
          />
        </Animated.View>
        <Animated.View entering={enter(d3 + 40, reduced)}>
          <Text style={styles.trust}>{t.trust}</Text>
        </Animated.View>
      </View>

      <Animated.View
        entering={enter(d4, reduced)}
        style={[styles.metrics, isDesktop && styles.metricsDesktop]}
      >
        {t.metrics.map((m, i) => (
          <Animated.View
            key={m.value + m.label}
            entering={enter(d4 + i * MOTION.staggerMs, reduced)}
            style={styles.metric}
          >
            <Text style={styles.metricValue}>{m.value}</Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
          </Animated.View>
        ))}
      </Animated.View>
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
    fontFamily: arFonts.extraBold,
    fontSize: 32,
    lineHeight: 44,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sub: {
    fontFamily: arFonts.regular,
    fontSize: 17,
    lineHeight: 30,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 720,
  },
  ctaRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 4 },
  trust: {
    fontFamily: arFonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 22,
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
    fontFamily: arFonts.monoMedium,
    fontSize: 28,
    color: colors.brandPrimary,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  metricLabel: {
    fontFamily: arFonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'right',
  },
});
