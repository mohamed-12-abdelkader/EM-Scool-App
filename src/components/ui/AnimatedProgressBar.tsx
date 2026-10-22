import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { arFonts, colors, MOTION, radii } from '@/theme/tokens';

type Props = {
  progress: number;
  label: string;
  trackColor?: string;
  fillColor?: string;
};

/** Animates fill width 0% → progress% (~750ms). */
export function AnimatedProgressBar({
  progress,
  label,
  trackColor = colors.bgCanvas,
  fillColor = colors.brandPrimary,
}: Props) {
  const reduced = useReducedMotion();
  const width = useSharedValue(reduced ? Math.min(100, Math.max(0, progress)) : 0);
  const clamped = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    width.value = withTiming(clamped, {
      duration: reduced ? 0 : MOTION.progressMs,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [clamped, reduced, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.pct}>{clamped}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.fill, { backgroundColor: fillColor }, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginVertical: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: arFonts.medium, fontSize: 13, color: colors.textSecondary, flex: 1, textAlign: 'right' },
  pct: {
    fontFamily: arFonts.monoMedium,
    fontSize: 13,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 8,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.full,
  },
});
