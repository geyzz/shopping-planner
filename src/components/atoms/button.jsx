import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function Button({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const isGold = variant === 'gold';

  return (
    <Pressable
      style={[
        styles.button,
        isGold && styles.buttonGold,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      <Text style={[styles.text, isGold && styles.textGold, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    button: {
      backgroundColor: colors.navy,
      paddingVertical: spacing.md - 4,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonGold: {
      backgroundColor: colors.gold,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    text: {
      ...typography.label,
      color: colors.white,
      fontSize: 16,
      fontWeight: '700',
    },
    textGold: {
      color: colors.onGold,
    },
  });