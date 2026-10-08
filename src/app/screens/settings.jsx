import SettingsRow from '@/components/molecules/settings_row';
import BottomNavigation from '@/components/organisms/bottom_nav';
import ProfileSummary from '@/components/organisms/profile_summary';
import {
  getNotificationsEnabled,
  requestNotificationPermission,
  setNotificationsEnabled,
  syncAllReminders,
} from '@/lib/notifications';
import { clearCachedLists, fetchListsWithCache } from '@/lib/lists_storage';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PROFILE_SETTINGS = [
  { id: 'edit_profile', label: 'Edit Profile', icon: 'user', path: '/screens/settings_screen/edit_profile' },
  { id: 'change_password', label: 'Change Password', icon: 'lock', path: '/screens/settings_screen/change_pass' },
];

export default function ProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchUser = async () => {
        try {
          // load user
          const cachedAvatar = await AsyncStorage.getItem('user_avatar_uri');
          if (isMounted && cachedAvatar) {
            setAvatarUrl(cachedAvatar);
          }

          const {
            data: { session },
          } = await supabase.auth.getSession();
          const sessionMeta = session?.user?.user_metadata;
          if (isMounted && sessionMeta) {
            if (sessionMeta.first_name) setName(sessionMeta.first_name);
            if (sessionMeta.avatar_url) setAvatarUrl(sessionMeta.avatar_url);
          }

          const {
            data: { user },
          } = await supabase.auth.getUser();
          const userMeta = user?.user_metadata;
          if (isMounted && userMeta) {
            if (userMeta.first_name) setName(userMeta.first_name);
            if (userMeta.avatar_url) setAvatarUrl(userMeta.avatar_url);
          }

          // check notifications
          const savedNotifEnabled = await getNotificationsEnabled();
          if (isMounted) {
            setNotifEnabled(savedNotifEnabled);
          }
        } catch (e) {
          console.log('Error fetching user profile:', e);
        }
      };

      fetchUser();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleNavigate = (path) => {
    router.push(path);
  };

  const handleToggleNotifications = async (value) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please allow notifications in your device settings to receive reminder alerts.'
        );
        setNotifEnabled(false);
        await setNotificationsEnabled(false);
        return;
      }
      setNotifEnabled(true);
      await setNotificationsEnabled(true);

      const { data: lists } = await fetchListsWithCache();
      await syncAllReminders(true, lists ?? []);
    } else {
      setNotifEnabled(false);
      await setNotificationsEnabled(false);
      await syncAllReminders(false);
    }
  };


  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('user_avatar_uri').catch(() => {});
      await clearCachedLists();
    } catch (e) {
      console.log('SignOut error:', e?.message);
    } finally {
      setLoggingOut(false);
      router.replace('/auth/login');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, spacing.sm) + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileSummary name={name} avatarUrl={avatarUrl} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Settings</Text>
          <View style={styles.sectionCard}>
            {PROFILE_SETTINGS.map((item, index) => (
              <View key={item.id}>
                <SettingsRow
                  title={item.label}
                  onPress={() => handleNavigate(item.path)}
                />
                {index < PROFILE_SETTINGS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          <View style={styles.sectionCard}>
            <SettingsRow
              title="Notifications"
              subtitle={notifEnabled ? 'Reminder alerts are active' : 'Reminder alerts are turned off'}
              toggle
              value={notifEnabled}
              onToggleChange={handleToggleNotifications}
            />

            <View style={styles.divider} />
            <SettingsRow
              title="Appearance"
              onPress={() => handleNavigate('/screens/settings_screen/appearance')}
            />
            <View style={styles.divider} />
            <SettingsRow
              title="About"
              onPress={() => handleNavigate('/screens/settings_screen/about')}
            />
          </View>
        </View>

        <Pressable
          style={[styles.logoutButton, loggingOut && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={loggingOut}
          hitSlop={12}
        >
          <Feather name="log-out" size={18} color={colors.error} />
          <Text style={styles.logoutButtonText}>
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </Text>
        </Pressable>
      </ScrollView>

      <BottomNavigation
        activeTab="settings"
        onTabPress={(path) => router.replace(path)}
        avatarUrl={avatarUrl}
      />
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: 160,
    },
    section: {
      marginTop: spacing.lg,
    },
    sectionTitle: {
      ...typography.label,
      fontSize: 14,
      color: colors.navy,
      fontWeight: '700',
      marginBottom: spacing.sm,
    },
    sectionCard: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: spacing.md - 4,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md - 4,
      marginTop: spacing.lg,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
    logoutButtonDisabled: {
      opacity: 0.6,
    },
    logoutButtonText: {
      color: colors.error,
      fontWeight: '700',
      fontSize: 14,
      marginLeft: spacing.sm,
    },
  });