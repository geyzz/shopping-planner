import { useAppTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/theme';
import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const LOGO_ICON = require('../../../assets/images/logo_icon_cropped.png');

export default function AppLogo({ size = 32, style }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors, size), [colors, size]);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={LOGO_ICON}
        style={styles.iconImage}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="Plan_.ed Logo"
      />
      <Text style={styles.brandText}>
        <Text style={styles.planText}>PLAN</Text>
        <Text style={styles.accentText}>_.</Text>
        <Text style={styles.edText}>ED</Text>
      </Text>
    </View>
  );
}

const makeStyles = (colors, size) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconImage: {
      width: Math.round(size * 0.95),
      height: size,
      marginRight: 8,
    },
    brandText: {
      fontFamily: fontFamilies.serif,
      fontSize: 22,
      fontWeight: '700',
      letterSpacing: 1.5,
    },
    planText: {
      color: colors.navy,
      fontFamily: fontFamilies.serif,
      fontWeight: '700',
    },
    accentText: {
      color: colors.gold,
      fontWeight: '700',
    },
    edText: {
      color: colors.gold,
      fontFamily: fontFamilies.serif,
      fontWeight: '700',
    },
  });