import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function GreetingBanner({ name, totalCount }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.greetingRow}>
      <Text style={styles.helloText}>Hello, {name || 'there'} 👋</Text>
      <Text style={styles.subtitleText}>
        You have {totalCount} {totalCount === 1 ? 'list' : 'lists'}
      </Text>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    greetingRow: {
      marginTop: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.white,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      justifyContent: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    helloText: {
      ...typography.subheading,
      color: colors.navy,
      fontSize: 18,
      fontWeight: '700',
    },
    subtitleText: {
      ...typography.body,
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },
  });