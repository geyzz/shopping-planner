import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home', path: '/screens/home' },
  { key: 'settings', label: 'Profile', icon: 'user', path: '/screens/settings' },
  { key: 'calendar', label: 'Calendar', icon: 'calendar', path: '/screens/calendar' },
];

export default function BottomNavigation({ activeTab, onTabPress }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomNav, { bottom: Math.max(insets.bottom, spacing.sm) + spacing.sm }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={styles.navItem}
            onPress={() => onTabPress(tab.path)}
          >
            <Feather
              name={tab.icon}
              size={24}
              color={isActive ? colors.navy : colors.textSecondary}
            />
            <Text style={[styles.navLabel, isActive && { color: colors.navy }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    bottomNav: {
      position: 'absolute',
      left: spacing.md,
      right: spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.sm,
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    navItem: {
      alignItems: 'center',
      paddingHorizontal: spacing.md,
    },
    navLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });