import { useAppTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BottomNavigation({ activeTab, onTabPress, avatarUrl }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const isHomeActive = activeTab === 'home';
  const isProfileActive = activeTab === 'settings';
  const isCalendarActive = activeTab === 'calendar';

  return (
    <View
      style={[
        styles.navContainer,
        { bottom: Math.max(insets.bottom, spacing.sm) + spacing.sm },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        {/* Left Tab: Home */}
        <Pressable
          style={styles.sideTab}
          hitSlop={12}
          onPress={() => onTabPress('/screens/home')}
          accessibilityRole="tab"
          accessibilityLabel="Home"
          accessibilityState={{ selected: isHomeActive }}
        >
          <Feather
            name="home"
            size={22}
            color={isHomeActive ? colors.navy : colors.textSecondary}
          />
          <Text style={[styles.tabLabel, isHomeActive && styles.tabLabelActive]}>Home</Text>
        </Pressable>

        {/* Center Spacer for the raised button */}
        <View style={styles.centerSpacer} />

        {/* Right Tab: Calendar */}
        <Pressable
          style={styles.sideTab}
          hitSlop={12}
          onPress={() => onTabPress('/screens/calendar')}
          accessibilityRole="tab"
          accessibilityLabel="Calendar"
          accessibilityState={{ selected: isCalendarActive }}
        >
          <Feather
            name="calendar"
            size={22}
            color={isCalendarActive ? colors.navy : colors.textSecondary}
          />
          <Text style={[styles.tabLabel, isCalendarActive && styles.tabLabelActive]}>Calendar</Text>
        </Pressable>
      </View>

      {/* Raised Center Profile Button */}
      <View style={styles.centerButtonWrapper} pointerEvents="box-none">
        <View style={styles.centerHalo}>
          <Pressable
            style={styles.centerButton}
            hitSlop={8}
            onPress={() => onTabPress('/screens/settings')}
            accessibilityRole="tab"
            accessibilityLabel="Profile"
            accessibilityState={{ selected: isProfileActive }}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.centerAvatarImage}
                resizeMode="cover"
              />
            ) : (
              <Feather
                name="user"
                size={24}
                color={isProfileActive ? colors.gold : colors.navy}
              />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    navContainer: {
      position: 'absolute',
      left: spacing.md,
      right: spacing.md,
      alignItems: 'center',
      zIndex: 10,
    },
    bar: {
      width: '100%',
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 32,
      paddingHorizontal: spacing.lg,
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    sideTab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      height: '100%',
    },
    tabLabel: {
      fontSize: 10,
      fontWeight: '500',
      color: colors.textSecondary,
      letterSpacing: 0.2,
    },
    tabLabelActive: {
      color: colors.navy,
      fontWeight: '700',
    },
    centerSpacer: {
      width: 64,
    },
    centerButtonWrapper: {
      position: 'absolute',
      top: -18,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerHalo: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 10,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    centerButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    centerAvatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 26,
    },
  });