import { useAppTheme } from '@/theme/ThemeContext';
import { typography } from '@/theme/theme';
import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

export default function AppLogo() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return <Text style={styles.logo}>Plan_.ed</Text>;
}

const makeStyles = (colors) =>
  StyleSheet.create({
    logo: {
      ...typography.heading,
      color: colors.navy,
    },
  });