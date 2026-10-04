import Header from '@/components/organisms/header';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const FEATURES = [
  { icon: 'list', title: 'Smart lists', description: 'Create shopping, gift, grocery and food lists.' },
  { icon: 'bell', title: 'Reminders', description: 'Set a date so you never forget a trip.' },
  { icon: 'map-pin', title: 'Locations', description: 'Pick the mall where you plan to shop.' },
  { icon: 'dollar-sign', title: 'Cost estimation', description: 'Track your budget against item prices.' },
  { icon: 'calendar', title: 'Calendar', description: 'See all your lists by reminder date.' },
];

export default function AboutPage() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const version = Constants.expoConfig?.version ?? '1.0.0';

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/screens/settings');
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="About" onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.appName}>Plan_.ed</Text>
          <Text style={styles.tagline}>Plan your trips before you shop.</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version {version}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>What you can do</Text>
        <View style={styles.card}>
          {FEATURES.map((feature, index) => (
            <View key={feature.title}>
              <View style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Feather name={feature.icon} size={18} color={colors.navy} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
              {index < FEATURES.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Made with care. Happy planning!</Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
    },
    hero: {
      alignItems: 'center',
      marginTop: spacing.lg,
      marginBottom: spacing.lg,
    },
    appName: {
      ...typography.heading,
      color: colors.navy,
    },
    tagline: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.sm / 2,
      textAlign: 'center',
    },
    versionBadge: {
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.gold,
      borderRadius: borderRadius.lg,
      paddingVertical: 4,
      paddingHorizontal: spacing.sm,
    },
    versionText: {
      ...typography.small,
      color: colors.navy,
      fontWeight: '600',
    },
    sectionLabel: {
      ...typography.label,
      color: colors.navy,
      fontWeight: '700',
      marginBottom: spacing.sm,
    },
    card: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md - 4,
    },
    featureIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    featureText: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    featureTitle: {
      ...typography.label,
      color: colors.text,
    },
    featureDescription: {
      ...typography.small,
      color: colors.textSecondary,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: spacing.md - 4,
    },
    footer: {
      ...typography.small,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.lg,
    },
  });