import { useAppTheme } from '@/theme/ThemeContext';
import { spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

export default function SettingsRow({ title, subtitle, onPress, toggle, value, onToggleChange }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && !toggle && styles.rowPressed]}
      onPress={toggle ? undefined : onPress}
    >
      <View style={styles.textGroup}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {toggle ? (
        <Switch
          value={value}
          onValueChange={onToggleChange}
          trackColor={{ false: colors.border, true: colors.gold }}
          thumbColor={colors.white}
        />
      ) : (
        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
      )}
    </Pressable>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md - 4,
      paddingHorizontal: spacing.md - 4,
    },
    rowPressed: {
      backgroundColor: colors.background,
    },
    textGroup: {
      flex: 1,
    },
    title: {
      ...typography.body,
      color: colors.text,
    },
    subtitle: {
      ...typography.small,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });