import type { ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { MOTION, SPRING_SNAPPY } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * Primary interaction wrapper — spring scale 0.97 on press (Clast skill).
 */
export function AnimatedPressable({
  children,
  onPress,
  disabled,
  style,
  accessibilityLabel,
}: Props) {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        if (disabled || reduced) return;
        scale.value = withSpring(MOTION.pressScale, SPRING_SNAPPY);
      }}
      onPressOut={() => {
        if (disabled || reduced) return;
        scale.value = withSpring(1, SPRING_SNAPPY);
      }}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
