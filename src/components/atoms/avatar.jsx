import { useAppTheme } from '@/theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

export default function Avatar({ icon = 'user', size = 88 }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Feather name={icon} size={size * 0.4} color={colors.navy} />
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    circle: {
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.gold,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });