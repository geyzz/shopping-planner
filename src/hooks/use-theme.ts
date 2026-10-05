import { useAppTheme } from '@/theme/ThemeContext';

export function useTheme() {
  const { colors } = useAppTheme();
  return colors;
}
