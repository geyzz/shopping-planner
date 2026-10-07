import Header from '@/components/organisms/header';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const OPTIONS = [
  { key: 'light', label: 'Light', description: 'Always use the light theme', icon: 'sun' },
  { key: 'dark', label: 'Dark', description: 'Always use the dark theme', icon: 'moon' },
  { key: 'system', label: 'System', description: 'Match your phone settings', icon: 'smartphone' },
];

export default function AppearancePage() {
  const router = useRouter();
  const { mode, setMode, colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.screen}>
      <Header title="Appearance" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Theme</Text>

        {OPTIONS.map((option) => {
          const selected = mode === option.key;

          return (
            <Pressable
              key={option.key}
              style={[styles.optionCard, selected && styles.optionCardSelected]}
              onPress={() => setMode(option.key)}
            >
              <View style={styles.optionIcon}>
                <Feather name={option.icon} size={20} color={colors.navy} />
              </View>

              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>

              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected && <Feather name="check" size={14} color={colors.white} />}
              </View>
            </Pressable>
          );
        })}

        <Text style={styles.sectionLabel}>Preview</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewImage}>
            <Feather name="file-text" size={28} color={colors.border} />
          </View>
          <Text style={styles.previewTitle}>Sample list</Text>
          <Text style={styles.previewDate}>Oct 1, 2026</Text>
          <View style={styles.previewButton}>
            <Text style={styles.previewButtonText}>View List</Text>
          </View>
        </View>
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
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
    optionCardSelected: {
      borderColor: colors.gold,
      borderWidth: 2,
    },
    optionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    optionText: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    optionDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      backgroundColor: colors.navy,
      borderColor: colors.navy,
    },
    previewCard: {
      width: '100%',
      maxWidth: 240,
      alignSelf: 'center',
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: 'center',
      marginTop: spacing.xs,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
    previewImage: {
      width: '100%',
      aspectRatio: 1.4,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    previewTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    previewDate: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
      marginBottom: spacing.sm,
    },
    previewButton: {
      width: '100%',
      alignItems: 'center',
      backgroundColor: colors.gold,
      borderRadius: borderRadius.md,
      paddingVertical: 8,
    },
    previewButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.onGold,
    },
  });