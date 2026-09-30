import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
          <Feather name="chevron-left" size={26} color={colors.navy} />
        </Pressable>
        <Text style={styles.title}>Appearance</Text>
        <View style={styles.backButton} />
      </View>

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

      {/* Live preview */}
      <Text style={styles.sectionLabel}>Preview</Text>
      <View style={styles.previewCard}>
        <View style={styles.previewImage}>
          <Feather name="image" size={28} color={colors.border} />
        </View>
        <Text style={styles.previewTitle}>Sample list</Text>
        <Text style={styles.previewDate}>Oct 1, 2026</Text>
        <View style={styles.previewButton}>
          <Text style={styles.previewButtonText}>Edit List</Text>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    backButton: {
      width: 32,
    },
    title: {
      ...typography.heading,
      fontSize: 20,
      color: colors.navy,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      marginBottom: spacing.sm,
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
      width: '48%',
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      alignItems: 'center',
    },
    previewImage: {
      width: '100%',
      aspectRatio: 1.4,
      borderRadius: 6,
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
      paddingVertical: 6,
    },
    previewButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.onGold,
    },
  });