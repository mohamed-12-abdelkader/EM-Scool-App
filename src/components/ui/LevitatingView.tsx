import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MOTION } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Stagger phase so multiple cards float independently */
  delayMs?: number;
};

/** Gentle Y-axis levitation for sign-in glass cards. */
export function LevitatingView({ children, style, delayMs = 0 }: Props) {
  const reduced = useReducedMotion();
  const y = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      y.value = 0;
      return;
    }
    const half = MOTION.levitateMs / 2;
    y.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(MOTION.levitateOffsetY, {
            duration: half,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, { duration: half, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [delayMs, reduced, y]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
