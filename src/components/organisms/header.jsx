import { useAppTheme } from '@/theme/ThemeContext';
import { spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, TextInput as RNTextInput, StyleSheet, Text, View } from 'react-native';

export default function Header({
  title,
  onBack,
  editableTitle,
  onTitleChange,
  rightAction,
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Feather name="arrow-left" size={24} color={colors.navy} />
      </Pressable>

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
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
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