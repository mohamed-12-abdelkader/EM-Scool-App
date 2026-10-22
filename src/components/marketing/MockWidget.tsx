import type { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { LivePulseDot } from '@/components/ui/LivePulseDot';
import { arFonts, colors, MOTION, radii, shadows } from '@/theme/tokens';

type Kpi = { value: string; label: string };

export function MockWidget({
  title,
  live = true,
  kpis,
  footer,
  children,
  dark = false,
  contentKey,
}: {
  title: string;
  live?: boolean;
  kpis?: Kpi[];
  footer?: string;
  children: ReactNode;
  dark?: boolean;
  /** Remount key so staggered row entrances replay on tab/role change */
  contentKey?: string;
}) {
  return (
    <View
      style={[
        styles.card,
        shadows.card,
        dark
          ? { backgroundColor: colors.bgDarkSurface, borderColor: colors.borderDark }
          : { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {live ? <LivePulseDot /> : null}
          <Text style={[styles.title, dark && { color: colors.textOnDark }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {kpis?.length ? (
          <View style={styles.kpiRow}>
            {kpis.map((k) => (
              <View
                key={k.label}
                style={[styles.kpi, dark && { backgroundColor: 'rgba(15,23,42,0.55)' }]}
              >
                <Text style={[styles.kpiValue, dark && { color: '#A5B4FC' }]}>{k.value}</Text>
                <Text style={[styles.kpiLabel, dark && { color: colors.textOnDarkMuted }]}>
                  {k.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View key={contentKey} style={styles.body}>
        {children}
      </View>
      {footer ? (
        <View style={[styles.footer, dark && { borderTopColor: colors.borderDark }]}>
          <Text style={[styles.footerText, dark && { color: colors.textOnDarkMuted }]}>{footer}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function MockRow({
  title,
  subtitle,
  right,
  dark = false,
  index = 0,
}: {
  title: string;
  subtitle?: string;
  right: ReactNode;
  dark?: boolean;
  index?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <Animated.View
      entering={
        reduced
          ? undefined
          : FadeInDown.delay(index * MOTION.staggerMs)
              .duration(400)
              .springify()
      }
      style={[styles.row, dark && { borderBottomColor: colors.borderDark }]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.rowTitle, dark && { color: colors.textOnDark }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSub, dark && { color: colors.textOnDarkMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 480,
  },
  header: { padding: 16, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: {
    fontFamily: arFonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpi: {
    flex: 1,
    backgroundColor: colors.bgCanvas,
    borderRadius: radii.lg,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  kpiValue: {
    fontFamily: arFonts.monoMedium,
    fontSize: 16,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontFamily: arFonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  body: { paddingHorizontal: 16, paddingBottom: 8 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(248,250,252,0.8)',
  },
  footerText: {
    fontFamily: arFonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  rowTitle: { fontFamily: arFonts.semiBold, fontSize: 14, color: colors.textPrimary },
  rowSub: { fontFamily: arFonts.regular, fontSize: 12, color: colors.textMuted },
});
