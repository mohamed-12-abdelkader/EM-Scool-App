import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { PillBadge } from './Badge';
import { MockWidget, MockRow } from './MockWidget';
import { landingAr } from '@/content/landing.ar';
import { arFonts, colors, MOTION, radii } from '@/theme/tokens';

const t = landingAr.roles;

export function RoleDashboardSwitcher() {
  const [active, setActive] = useState<string>(t.items[1].id);
  const role = t.items.find((r) => r.id === active) || t.items[1];
  const reduced = useReducedMotion();

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>{t.eyebrow}</Text>
      <Text style={styles.h2}>{t.title}</Text>
      <Text style={styles.p}>{t.subtitle}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
        {t.items.map((r) => (
          <AnimatedPressable
            key={r.id}
            onPress={() => setActive(r.id)}
            style={[styles.pill, active === r.id && styles.pillActive]}
          >
            <Text style={[styles.pillText, active === r.id && styles.pillTextActive]}>{r.label}</Text>
          </AnimatedPressable>
        ))}
      </ScrollView>

      <Animated.View
        key={role.id}
        entering={reduced ? undefined : FadeInDown.duration(MOTION.tabEnterMs).springify()}
        style={styles.preview}
      >
        <PillBadge label={role.scope} tone="violet" />
        <MockWidget title={`${role.label} · معاينة`} kpis={[...role.kpis]} contentKey={role.id}>
          {role.rows.map((row, index) => (
            <MockRow
              key={row.title}
              index={index}
              title={row.title}
              subtitle={row.subtitle}
              right={<PillBadge label={row.badge} tone={row.tone} />}
            />
          ))}
        </MockWidget>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 72,
    paddingHorizontal: 24,
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 12,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: arFonts.semiBold,
    fontSize: 12,
    color: colors.brandPrimary,
  },
  h2: {
    fontFamily: arFonts.extraBold,
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'center',
    maxWidth: 640,
    lineHeight: 40,
  },
  p: {
    fontFamily: arFonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 640,
    lineHeight: 28,
    marginBottom: 12,
  },
  pills: { gap: 8, paddingVertical: 8, paddingHorizontal: 4 },
  pill: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgCanvas,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  pillText: { fontFamily: arFonts.semiBold, fontSize: 13, color: colors.textSecondary },
  pillTextActive: { color: '#fff' },
  preview: { marginTop: 20, width: '100%', maxWidth: 520, gap: 12, alignItems: 'center' },
});
