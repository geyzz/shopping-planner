import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, TextInput as RNTextInput, StyleSheet, Text, View } from 'react-native';

export default function FormField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  error,
  compact = false,
  onFocus,
  onBlur,
  ...inputProps
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [isFocused, setIsFocused] = useState(false);
  const [isHidden, setIsHidden] = useState(Boolean(secureTextEntry));

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.field, compact && styles.fieldCompact]}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputRow,
          isFocused && styles.inputRowFocused,
          error && styles.inputRowError,
        ]}
      >
        <RNTextInput
          style={[styles.input, compact && styles.inputCompact]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry ? isHidden : false}
          autoCapitalize={secureTextEntry ? 'none' : inputProps.autoCapitalize}
          autoCorrect={secureTextEntry ? false : inputProps.autoCorrect}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...inputProps}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setIsHidden((prev) => !prev)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isHidden ? 'Show password' : 'Hide password'}
          >
            <Feather name={isHidden ? 'eye-off' : 'eye'} size={20} color={colors.navy} />
          </Pressable>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    field: {
      marginTop: spacing.md,
    },
    fieldCompact: {
      marginTop: spacing.sm,
    },
    label: {
      ...typography.label,
      marginBottom: spacing.sm / 2,
      color: colors.text,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md - 4,
    },
    inputRowFocused: {
      borderColor: colors.navy,
    },
    inputRowError: {
      borderColor: colors.error,
    },
    input: {
      flex: 1,
      paddingVertical: spacing.md - 4,
      fontSize: 16,
      color: colors.text,
    },
    inputCompact: {
      paddingVertical: spacing.sm - 2,
    },
    errorText: {
      ...typography.small,
      color: colors.error,
      marginTop: 4,
    },
  });