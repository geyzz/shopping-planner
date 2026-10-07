import Button from '@/components/atoms/button';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  buttonVariant = 'gold',
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScrollView
        contentContainerStyle={styles.screen}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.box, compact && styles.boxCompact]}>
          <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>

          {children}

          {onSubmit && (
            <View style={{ marginTop: submitSpacing }}>
              <Button
                title={loading ? loadingLabel : submitLabel}
                onPress={onSubmit}
                disabled={loading}
                variant={buttonVariant}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.background,
    },
    screen: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
    },
    box: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
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