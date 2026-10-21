import type { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii, shadows } from '@/theme/tokens';

type Kpi = { value: string; label: string };

export function MockWidget({
  title,
  live = true,
  kpis,
  footer,
  children,
  dark = false,
}: {
  title: string;
  live?: boolean;
  kpis?: Kpi[];
  footer?: string;
  children: ReactNode;
  dark?: boolean;
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
          {live ? <View style={styles.pulse} /> : null}
          <Text style={[styles.title, dark && { color: colors.textOnDark }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {kpis?.length ? (
          <View style={styles.kpiRow}>
            {kpis.map((k) => (
              <View key={k.label} style={styles.kpi}>
                <Text style={[styles.kpiValue, dark && { color: '#A5B4FC' }]}>{k.value}</Text>
                <Text style={[styles.kpiLabel, dark && { color: colors.textOnDarkMuted }]}>
                  {k.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.body}>{children}</View>
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
}: {
  title: string;
  subtitle?: string;
  right: ReactNode;
  dark?: boolean;
}) {
  return (
    <View style={[styles.row, dark && { borderBottomColor: colors.borderDark }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.rowTitle, dark && { color: colors.textOnDark }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSub, dark && { color: colors.textOnDarkMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
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
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.statusSuccess,
  },
  title: {
    fontFamily: fonts.semiBold,
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
    fontFamily: fonts.monoMedium,
    fontSize: 16,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontFamily: fonts.medium,
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
    fontFamily: fonts.medium,
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
  rowTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  rowSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
});
