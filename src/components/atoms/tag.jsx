import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function Tag({ label, icon, selected, onPress }) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      {icon && (
        <Feather
          name={icon}
          size={16}
          color={selected ? (isDark ? '#1B2A4A' : '#FFFFFF') : colors.navy}
        />
      )}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const makeStyles = (colors, isDark) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm / 2,
      paddingHorizontal: spacing.sm,
      marginRight: spacing.sm,
      marginBottom: spacing.sm / 2,
      backgroundColor: isDark ? '#1F293D' : '#F7F8FA',
    },
    chipSelected: {
      backgroundColor: colors.navy,
      borderColor: colors.navy,
    },
    chipText: {
      fontSize: 13,
      color: colors.text,
      marginLeft: spacing.sm / 2,
    },
    chipTextSelected: {
      color: isDark ? '#1B2A4A' : '#FFFFFF',
      fontWeight: '600',
    },
  });