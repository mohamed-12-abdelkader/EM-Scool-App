import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radii, spacing } from '@/theme/tokens';
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
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  field: {
    flexDirection: 'row',
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
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 10,
  },
  error: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.statusDanger,
  },
});
