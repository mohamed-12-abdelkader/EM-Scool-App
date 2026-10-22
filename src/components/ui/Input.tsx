import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { arFonts, colors, radii, spacing } from '@/theme/tokens';
import { Icon } from './Icon';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
}

export function Input({ label, error, icon, style, ...props }: InputProps) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, error ? styles.fieldError : null]}>
        {icon ? <Icon name={icon} size={18} color={colors.textMuted} /> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          {...props}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: arFonts.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  field: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  fieldError: {
    borderColor: colors.statusDanger,
  },
  input: {
    flex: 1,
    fontFamily: arFonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 10,
    textAlign: 'right',
  },
  error: {
    fontFamily: arFonts.medium,
    fontSize: 12,
    color: colors.statusDanger,
    textAlign: 'right',
  },
});

