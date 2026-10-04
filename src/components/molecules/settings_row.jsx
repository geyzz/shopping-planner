import { useAppTheme } from '@/theme/ThemeContext';
import { spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SettingsRow({ title, subtitle, onPress }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={styles.textGroup}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <Feather name="chevron-right" size={18} color={colors.textSecondary} />
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