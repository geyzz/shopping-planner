import { useAppTheme } from '@/theme/ThemeContext';
import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const LOGO_LIGHT = require('../../../assets/images/plan_ed_logo.png');
const LOGO_DARK = require('../../../assets/images/plan_ed_logo_dark.png');
const ASPECT_RATIO = 967 / 241;

export default function AppLogo({ height, size = 36, width, style }) {
  const { isDark } = useAppTheme();
  const logoHeight = height ?? size;
  const logoWidth = width ?? Math.round(logoHeight * ASPECT_RATIO);

  const styles = useMemo(() => makeStyles(logoWidth, logoHeight), [logoWidth, logoHeight]);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={isDark ? LOGO_DARK : LOGO_LIGHT}
        style={styles.image}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="Plan_.ed"
      />
    </View>
  );
}

const makeStyles = (width, height) =>
  StyleSheet.create({
    container: {
      justifyContent: 'center',
    },
    image: {
      width,
      height,
    },
  });