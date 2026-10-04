import Button from '@/components/atoms/button';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AuthCard({
  title,
  children,
  submitLabel,
  loadingLabel,
  loading,
  onSubmit,
  footerText,
  linkLabel,
  linkHref,
  submitSpacing = spacing.lg,
  compact = false,
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.screen}>
      <View style={[styles.box, compact && styles.boxCompact]}>
        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>

        {children}

        {onSubmit && (
          <View style={{ marginTop: submitSpacing }}>
            <Button
              title={loading ? loadingLabel : submitLabel}
              onPress={onSubmit}
              disabled={loading}
            />
          </View>
        )}

        {footerText && linkHref && (
          <>
            <Text style={styles.footerText}>{footerText}</Text>
            <Link href={linkHref} style={styles.signupLink}>
              {linkLabel}
            </Link>
          </>
        )}
      </View>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
    },
    box: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    boxCompact: {
      padding: spacing.md,
      maxWidth: 340,
    },
    title: {
      ...typography.heading,
      color: colors.navy,
      textAlign: 'center',
      alignSelf: 'stretch',
      marginBottom: spacing.md,
    },
    titleCompact: {
      marginBottom: 0,
    },
    footerText: {
      textAlign: 'center',
      marginTop: spacing.lg,
      color: colors.textSecondary,
    },
    signupLink: {
      textAlign: 'center',
      color: colors.navy,
      fontWeight: '700',
      marginTop: 4,
    },
  });