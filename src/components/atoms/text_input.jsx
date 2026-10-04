import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { useMemo, useState } from 'react';
import { TextInput as RNTextInput, StyleSheet } from 'react-native';

export default function TextInput({
  value,
  placeholder,
  onChangeText,
  secureTextEntry,
  error,
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <RNTextInput
      style={[
        styles.input,
        isFocused && styles.inputFocused,
        error && styles.inputError,
      ]}
      value={value}
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      color: colors.text,
      ...typography.body,
    },
    inputFocused: {
      borderColor: colors.navy,
    },
    inputError: {
      borderColor: colors.error,
    },
  });