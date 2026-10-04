import Avatar from '@/components/atoms/avatar';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing, typography } from '@/theme/theme';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileSummary({ name }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Avatar />
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      marginTop: spacing.lg,
      marginBottom: spacing.lg,
    },
    name: {
      ...typography.heading,
      fontSize: 18,
      color: colors.navy,
      marginTop: spacing.sm,
    },
  });