import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function GreetingBanner({ name, totalCount }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.greetingRow}>
      <Text style={styles.greetingText}>
        Hello {name}
        {'\n'}
        Your total notes are {totalCount}
      </Text>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    
    greetingRow: {
      alignItems: 'flex-start',
      justifyContent: 'center',
      marginTop: spacing.md,
      height: '15%',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.white,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    greetingText: {
      ...typography.label,
      color: colors.text,
      alignItems: 'center',
      fontSize: 20
    },
  });