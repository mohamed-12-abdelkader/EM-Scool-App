import { View, Text, StyleSheet } from 'react-native';
import { landingAr } from '@/content/landing.ar';
import { arFonts, colors, radii, shadows } from '@/theme/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
const t = landingAr.beforeAfter;

export function BeforeAfterSection() {
  const { isDesktop } = useBreakpoint();
  return (
    <View style={styles.wrap}>
      <Text style={styles.h2}>{t.title}</Text>
      <View style={[styles.grid, isDesktop && { flexDirection: 'row' }]}>
        <View style={[styles.col, styles.before, shadows.card]}>
          <Text style={styles.colTitle}>{t.beforeTitle}</Text>
          {t.before.map((line) => (
            <Text key={line} style={styles.item}>
              <Text style={{ color: colors.statusDanger }}>✕ </Text>
              {line}
            </Text>
          ))}
        </View>
        <View style={[styles.col, styles.after, shadows.card]}>
          <Text style={styles.colTitle}>{t.afterTitle}</Text>
          {t.after.map((line) => (
            <Text key={line} style={styles.item}>
              <Text style={{ color: colors.statusSuccess }}>✓ </Text>
              {line}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 72,
    paddingHorizontal: 24,
    backgroundColor: colors.bgCanvas,
    gap: 28,
    alignItems: 'center',
  },
  h2: {
    fontFamily: arFonts.extraBold,
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
  },
  grid: { width: '100%', maxWidth: 1100, gap: 16 },
  col: {
    flex: 1,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    padding: 24,
    gap: 12,
    backgroundColor: colors.bgSurface,
  },
  before: { borderColor: '#FECDD3' },
  after: { borderColor: '#C7D2FE' },
  colTitle: {
    fontFamily: arFonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'right',
  },
  item: {
    fontFamily: arFonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'right',
  },
});
