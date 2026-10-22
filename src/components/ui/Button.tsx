import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { arFonts, colors, radii, spacing } from '@/theme/tokens';
import { AnimatedPressable } from './AnimatedPressable';
import { Icon } from './Icon';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: string;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  style,
  fullWidth,
}: ButtonProps) {
  const tone = variantStyles[variant];
  const sizing = sizeStyles[size];

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        {
          backgroundColor: tone.bg,
          borderColor: tone.border,
          opacity: disabled ? 0.5 : 1,
          paddingHorizontal: sizing.px,
          paddingVertical: sizing.py,
          borderRadius: radii.xl,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        variant === 'primary' ? styles.primaryShadow : null,
        style,
      ]}
    >
      <View style={styles.row}>
        {icon ? <Icon name={icon} size={sizing.icon} color={tone.text} /> : null}
        <Text style={[styles.label, { color: tone.text, fontSize: sizing.font }]}>{label}</Text>
      </View>
    </AnimatedPressable>
  );
}

const variantStyles = {
  primary: { bg: colors.brandPrimary, border: colors.brandPrimary, text: '#FFFFFF' },
  secondary: { bg: colors.brandAccent, border: colors.brandAccent, text: '#FFFFFF' },
  outline: { bg: colors.bgSurface, border: '#CBD5E1', text: colors.textPrimary },
  ghost: { bg: 'transparent', border: 'transparent', text: colors.textSecondary },
  danger: { bg: colors.dangerSoft, border: colors.dangerSoft, text: colors.danger },
};

const sizeStyles = {
  sm: { px: 12, py: 8, font: 13, icon: 14 },
  md: { px: 16, py: 10, font: 14, icon: 16 },
  lg: { px: 22, py: 14, font: 15, icon: 18 },
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
  },
  primaryShadow: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: arFonts.semiBold,
  },
});
