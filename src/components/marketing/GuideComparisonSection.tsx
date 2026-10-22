import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { landingAr } from '@/content/landing.ar';
import { arFonts, colors, radii, shadows } from '@/theme/tokens';
const t = landingAr.guide;

export function GuideComparisonSection() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.h2}>{t.title}</Text>
      <Text style={styles.p}>{t.subtitle}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
        {t.cards.map((m) => (
          <View key={m.name} style={[styles.card, shadows.card]}>
            <Text style={styles.cardName}>{m.name}</Text>
            <Text style={styles.cardFull}>{m.full}</Text>
            <Text style={styles.cardDesc}>{m.desc}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.h3}>{t.workflowsTitle}</Text>
      <View style={styles.flowRow}>
        {t.workflows.map((w, i) => (
          <View key={w.title} style={[styles.flow, shadows.sm]}>
            <Text style={styles.flowN}>{i + 1}</Text>
            <Text style={styles.flowTitle}>{w.title}</Text>
            <Text style={styles.flowSteps}>{w.steps}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 72,
    paddingHorizontal: 24,
    backgroundColor: colors.bgCanvas,
    gap: 16,
    alignItems: 'center',
  },
  h2: {
    fontFamily: arFonts.extraBold,
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
  },
  p: {
    fontFamily: arFonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 720,
    lineHeight: 28,
    marginBottom: 8,
  },
  cards: { gap: 12, paddingVertical: 8 },
  card: {
    width: 260,
    backgroundColor: colors.bgSurface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 18,
    gap: 8,
  },
  cardName: { fontFamily: arFonts.extraBold, fontSize: 20, color: colors.brandPrimary, textAlign: 'right' },
  cardFull: { fontFamily: arFonts.semiBold, fontSize: 14, color: colors.textPrimary, textAlign: 'right' },
  cardDesc: { fontFamily: arFonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 22, textAlign: 'right' },
  h3: {
    fontFamily: arFonts.bold,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: 24,
    textAlign: 'center',
  },
  flowRow: {
    width: '100%',
    maxWidth: 1100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  flow: {
    flexGrow: 1,
    flexBasis: 280,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    gap: 8,
  },
  flowN: {
    fontFamily: arFonts.monoMedium,
    fontSize: 18,
    color: colors.brandPrimary,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  flowTitle: { fontFamily: arFonts.bold, fontSize: 16, color: colors.textPrimary, textAlign: 'right' },
  flowSteps: { fontFamily: arFonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 22, textAlign: 'right' },
});
