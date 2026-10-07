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
      <RNTextInput
        style={[styles.input, compact && styles.inputCompact]}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        onChangeText={onChangeText}
      />
      {value?.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={6} style={styles.clearBtn}>
          <Feather name="x" size={iconSize} color={colors.textSecondary} />
        </Pressable>
      )}
      <Feather name="search" size={iconSize} color={colors.textSecondary} />
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
      borderRadius: borderRadius.full,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.white,
    },
    containerCompact: {
      paddingVertical: 7,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.full,
    },
    input: {
      flex: 1,
      color: colors.text,
      marginRight: spacing.sm,
      paddingVertical: 0,
      ...typography.body,
    },
    inputCompact: {
      marginRight: 6,
      paddingVertical: 0,
      fontSize: 13,
    },
    clearBtn: {
      marginRight: 6,
    },
  });