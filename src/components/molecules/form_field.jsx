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
  ...inputProps
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [isFocused, setIsFocused] = useState(false);
  const [isHidden, setIsHidden] = useState(secureTextEntry);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputRow,
          isFocused && styles.inputRowFocused,
          error && styles.inputRowError,
        ]}
      >
        <RNTextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry ? isHidden : false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...inputProps}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setIsHidden(!isHidden)}>
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
    errorText: {
      ...typography.small,
      color: colors.error,
      marginTop: 4,
    },
  });