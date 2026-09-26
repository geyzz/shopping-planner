import { Platform } from 'react-native';

export const colors = {
  navy: '#1B2A4A',
  navyLight: '#2C3E5F',
  gold: '#D4AF37',
  white: '#FFFFFF',
  background: '#FFFFFF',
  text: '#1B2A4A',
  textSecondary: '#60646C',
  placeholder: '#8A93A6',
  border: '#CCCCCC',
  error: '#D64545',
};

export const fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const spacing = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 64,
};

export const typography = {
  heading: { fontSize: 28, fontWeight: '700' },
  subheading: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  label: { fontSize: 14, fontWeight: '600' },
  small: { fontSize: 12, fontWeight: '400' },
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
};

export const bottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const maxContentWidth = 800;