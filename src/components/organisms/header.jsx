import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, TextInput as RNTextInput, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header({
  title,
  onBack,
  hideBack = false,
  editableTitle,
  onTitleChange,
  rightAction,
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.header, { marginTop: insets.top + spacing.sm }]}>
      {!hideBack && (
        <Pressable style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={24} color={colors.navy} />
        </Pressable>
      )}

      {editableTitle ? (
        <RNTextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor={colors.placeholder}
          value={title}
          onChangeText={onTitleChange}
        />
      ) : (
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>
      )}

      {rightAction || <View style={styles.headerSpacer} />}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    backButton: {
      marginRight: spacing.sm,
    },
    titleInput: {
      flex: 1,
      ...typography.heading,
      fontSize: 20,
      color: colors.navy,
      paddingVertical: spacing.sm / 2,
    },
    titleText: {
      flex: 1,
      ...typography.heading,
      fontSize: 20,
      color: colors.navy,
    },
    headerSpacer: {
      width: 32,
    },
  });