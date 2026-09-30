import { colors as lightColors } from '@/theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

const STORAGE_KEY = 'appearance_mode'; // 'light' | 'dark' | 'system'

const darkColors = {
  ...lightColors,
  navy: '#E8ECF5',
  navyLight: '#C9D2E6',
  gold: '#D4AF37',
  onGold: '#1B2A4A',
  white: '#1A2233',
  background: '#0F1623',
  text: '#F2F4F8',
  textSecondary: '#A3ACBD',
  placeholder: '#7A8499',
  border: '#2E3A52',
  error: '#E5636A',
};

const ThemeContext = createContext({
  mode: 'system',
  setMode: () => {},
  isDark: false,
  colors: lightColors,
});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') setModeState(saved);
      })
      .catch(() => {});
  }, []);

  const setMode = (next) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const value = useMemo(
    () => ({ mode, setMode, isDark, colors: isDark ? darkColors : lightColors }),
    [mode, isDark]
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);