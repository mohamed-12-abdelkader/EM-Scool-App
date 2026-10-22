import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { arFonts, colors, radii } from '@/theme/tokens';

type Tone = 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'slate' | 'dark';

const tones: Record<Tone, { bg: string; text: string; border: string }> = {
  indigo: { bg: colors.brandSoft, text: colors.brandPrimary, border: '#C7D2FE' },
  violet: { bg: colors.brandAccentSoft, text: colors.brandAccent, border: '#DDD6FE' },
  emerald: { bg: colors.statusSuccessSoft, text: '#059669', border: '#A7F3D0' },
  amber: { bg: colors.statusWarningSoft, text: '#B45309', border: '#FDE68A' },
  rose: { bg: colors.statusDangerSoft, text: '#E11D48', border: '#FECDD3' },
  slate: { bg: '#F1F5F9', text: colors.textSecondary, border: colors.borderSubtle },
  dark: { bg: 'rgba(79,70,229,0.15)', text: '#A5B4FC', border: 'rgba(99,102,241,0.35)' },
};

export function PillBadge({
  label,
  tone = 'indigo',
  style,
}: {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
}) {
  const t = tones[tone];
  return (
    <View style={[styles.base, { backgroundColor: t.bg, borderColor: t.border }, style]}>
      <Text style={[styles.text, { color: t.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  text: {
    fontFamily: arFonts.semiBold,
    fontSize: 12,
  },
});
