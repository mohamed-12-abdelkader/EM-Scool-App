import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme/tokens';

type Props = {
  color?: string;
  size?: number;
};

/** Live status dot + expanding halo ring (attendance / GPS / admissions). */
export function LivePulseDot({ color = colors.statusSuccess, size = 8 }: Props) {
  const reduced = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [pulse, reduced]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: reduced ? 0 : 0.55 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.9 }],
  }));

  return (
    <View style={[styles.wrap, { width: size * 2.2, height: size * 2.2 }]}>
      <Animated.View
        style={[
          styles.halo,
          {
            width: size * 2.2,
            height: size * 2.2,
            borderRadius: size * 1.1,
            backgroundColor: color,
          },
          haloStyle,
        ]}
      />
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute' },
  dot: {},
});
