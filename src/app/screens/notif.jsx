import Header from '@/components/organisms/header';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function NotificationsPage() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/screens/home');
    }
  };

  const notifications = [];

  return (
    <>
      <Header title="Notifications" onBack={handleBack} />

      <View style={styles.screen}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="bell-off" size={32} color={colors.border} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.notifCard}>
                <Feather name="bell" size={18} color={colors.navy} />
                <View style={styles.notifText}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: spacing.sm,
    },
    list: {
      padding: spacing.md,
    },
    notifCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
    notifText: {
      marginLeft: 12,
      flex: 1,
    },
    notifTitle: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    notifTime: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });