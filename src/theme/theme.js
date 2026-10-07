import { Platform } from 'react-native';

export const colors = {
  navy: '#1B2A4A',
  navyLight: '#2C3E5F',
  gold: '#D4AF37',
  onGold: '#1B2A4A', // text/icons that sit on gold, same in light and dark
  white: '#FFFFFF',
  background: '#FFFFFF',
  text: '#1B2A4A',
  textSecondary: '#60646C',
  placeholder: '#8A93A6',
  border: '#CCCCCC',
  error: '#D64545',
};

export const fontFamilies = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    serif: 'Georgia',
    mono: 'Courier',
  },
  android: {
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    bold: 'sans-serif',
    serif: 'serif',
    mono: 'monospace',
  },
  default: {
    regular: 'sans-serif',
    medium: 'sans-serif',
    bold: 'sans-serif',
    serif: 'serif',
    mono: 'monospace',
  },
});

export const fonts = {
  sans: fontFamilies.regular,
  sansMedium: fontFamilies.medium,
  sansBold: fontFamilies.bold,
  serif: fontFamilies.serif,
  mono: fontFamilies.mono,
};

export const spacing = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 64,
};

export const typography = {
  heading: {
    fontFamily: fontFamilies.bold,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  subheading: {
    fontFamily: fontFamilies.medium,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  label: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  small: {
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.2,
  },
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
};

export const bottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const maxContentWidth = 800;