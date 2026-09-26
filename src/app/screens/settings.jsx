import { useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/theme/theme';

const PROFILE_SETTINGS = [
  { id: 'edit_profile', label: 'Edit Profile', icon: 'user', path: '/screens/edit_profile' },
  { id: 'change_password', label: 'Change Password', icon: 'lock', path: '/screens/change_password' },
];

const GENERAL_SETTINGS = [
  { id: 'notifications', label: 'Notifications', icon: 'bell', path: '/screens/notifications' },
  { id: 'appearance', label: 'Appearance', icon: 'sun', path: '/screens/appearance' },
  { id: 'about', label: 'About', icon: 'info', path: '/screens/about' },
];

export default function ProfilePage() {
  const router = useRouter();

  const name = 'Geyz';

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/screens/home');
    }
  };

  const handleNavigate = (path) => {
    router.push(path);
  };

  const handleLogout = () => {
    // TODO: clear auth/session state once auth is wired up.
    router.replace('/screens/login');
  };

  const goToTab = (pathname) => {
    router.replace(pathname);
  };

  const renderSettingRow = (item) => (
    <Pressable
      key={item.id}
      style={styles.settingRow}
      onPress={() => handleNavigate(item.path)}
    >
      <View style={styles.settingRowLeft}>
        <Feather name={item.icon} size={18} color={colors.navy} />
        <Text style={styles.settingLabel}>{item.label}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textSecondary} />
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color={colors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={36} color={colors.navy} />
          </View>
          <Text style={styles.nameText}>{name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Settings</Text>
          <View style={styles.sectionCard}>
            {PROFILE_SETTINGS.map((item, index) => (
              <View key={item.id}>
                {renderSettingRow(item)}
                {index < PROFILE_SETTINGS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          <View style={styles.sectionCard}>
            {GENERAL_SETTINGS.map((item, index) => (
              <View key={item.id}>
                {renderSettingRow(item)}
                {index < GENERAL_SETTINGS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={colors.error} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => goToTab('/screens/home')}>
          <Feather name="home" size={24} color={colors.textSecondary} />
          <Text style={styles.navLabel}>Home</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => goToTab('/screens/profile')}>
          <Feather name="user" size={24} color={colors.navy} />
          <Text style={styles.navLabel}>Profile</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => goToTab('/screens/calendar')}>
          <Feather name="calendar" size={24} color={colors.textSecondary} />
          <Text style={styles.navLabel}>Calendar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 32,
  },
  headerTitle: {
    ...typography.heading,
    fontSize: 18,
    color: colors.navy,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 160,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  nameText: {
    ...typography.heading,
    fontSize: 18,
    color: colors.navy,
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
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md - 4,
    paddingHorizontal: spacing.md - 4,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
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
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md - 4,
    marginTop: spacing.lg,
  },
  logoutButtonText: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: spacing.sm,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});