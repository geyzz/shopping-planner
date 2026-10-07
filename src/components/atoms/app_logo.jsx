import { useAppTheme } from '@/theme/ThemeContext';
import { Image, StyleSheet, View } from 'react-native';

const WORDMARK_LIGHT = require('../../../assets/images/plan_ed_wordmark_cropped.png');
const WORDMARK_DARK = require('../../../assets/images/plan_ed_wordmark_dark.png');

export default function AppLogo({ height = 26, style }) {
  const { isDark } = useAppTheme();
  const width = Math.round(height * (769 / 153));

  return (
    <View style={[styles.container, style]}>
      <Image
        source={isDark ? WORDMARK_DARK : WORDMARK_LIGHT}
        style={{ width, height }}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="PLAN__.ed"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});