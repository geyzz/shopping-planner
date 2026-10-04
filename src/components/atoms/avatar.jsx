import { useAppTheme } from '@/theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function Avatar({ icon = 'user', image, size = 88 }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <Feather name={icon} size={size * 0.4} color={colors.navy} />
      )}
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
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
  });