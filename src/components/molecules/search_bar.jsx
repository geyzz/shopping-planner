import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, TextInput as RNTextInput, StyleSheet, View } from 'react-native';

export default function SearchBar({ value, onChangeText, placeholder, compact = false }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const iconSize = compact ? 16 : 18;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Feather name="search" size={iconSize} color={colors.textSecondary} />
      <RNTextInput
        style={[styles.input, compact && styles.inputCompact]}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        onChangeText={onChangeText}
      />
      {value?.length > 0 && (
        <Pressable onPress={() => onChangeText('')}>
          <Feather name="x" size={iconSize} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.white,
    },
    containerCompact: {
      paddingVertical: 6,
      paddingHorizontal: spacing.sm,
    },
    input: {
      flex: 1,
      marginLeft: spacing.sm,
      color: colors.text,
      ...typography.body,
    },
    inputCompact: {
      marginLeft: 6,
      paddingVertical: 0,
      fontSize: 13,
    },
  });