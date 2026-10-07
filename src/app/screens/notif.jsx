import Tag from '@/components/atoms/tag';
import Header from '@/components/organisms/header';
import { computeFireDate } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const dateStr = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateStr} • ${timeStr}`;
};

export default function NotificationsPage() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReminders = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('lists').select('*');
      if (error) {
        console.log('Error fetching reminders:', error.message);
        return;
      }

      const now = Date.now();
      const listReminders = (data ?? [])
        .filter((list) => Boolean(list.details?.reminderDate))
        .map((list) => {
          const reminderDate = list.details.reminderDate;
          const reminderTiming = list.details.reminderTiming || 'on';
          const fireDate = computeFireDate(reminderDate, reminderTiming);
          const isPast = fireDate ? fireDate.getTime() <= now : false;

          return {
            id: String(list.id),
            title: list.title || 'Untitled List',
            reminderType: list.details.reminderType || 'general',
            reminderDate,
            reminderTiming,
            fireDate,
            isPast,
            rawList: list,
          };
        })
        .sort((a, b) => {
          // Upcoming items first (sorted by closest fireDate), then past items
          if (a.isPast !== b.isPast) {
            return a.isPast ? 1 : -1;
          }
          const timeA = a.fireDate ? a.fireDate.getTime() : 0;
          const timeB = b.fireDate ? b.fireDate.getTime() : 0;
          return a.isPast ? timeB - timeA : timeA - timeB;
        });

      setReminders(listReminders);
    } catch (e) {
      console.log('Error loading reminders:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReminders();
    }, [fetchReminders])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReminders();
    setRefreshing(false);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/screens/home');
    }
  };

  const handleOpenList = (list) => {
    router.push({
      pathname: '/screens/view_list',
      params: { list: JSON.stringify(list) },
    });
  };

  const getTimingLabel = (timing) => {
    if (timing === 'before') return '1 day before';
    if (timing === 'after') return 'Follow-up';
    return 'On date';
  };

  const renderReminderItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => handleOpenList(item.rawList)}
    >
      <View style={[styles.iconBadge, item.isPast && styles.iconBadgePast]}>
        <Feather
          name={item.isPast ? 'check-circle' : 'bell'}
          size={18}
          color={item.isPast ? colors.textSecondary : colors.gold}
        />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.statusBadge, item.isPast ? styles.statusPast : styles.statusUpcoming]}>
            <Text style={[styles.statusText, item.isPast ? styles.statusTextPast : styles.statusTextUpcoming]}>
              {item.isPast ? 'Passed' : 'Upcoming'}
            </Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Feather name="clock" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={styles.dateText}>{formatDateTime(item.fireDate)}</Text>
        </View>

        <View style={styles.tagRow}>
          {item.reminderType ? (
            <Tag label={item.reminderType} selected={false} />
          ) : null}
          <View style={styles.timingPill}>
            <Feather name="calendar" size={12} color={colors.navy} style={{ marginRight: 4 }} />
            <Text style={styles.timingPillText}>{getTimingLabel(item.reminderTiming)}</Text>
          </View>
        </View>
      </View>

      <Feather name="chevron-right" size={18} color={colors.textSecondary} />
    </Pressable>
  );

  return (
    <>
      <Header title="Notifications" onBack={handleBack} />

      <View style={styles.screen}>
        {reminders.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBadge}>
              <Feather name="bell-off" size={32} color={colors.border} />
            </View>
            <Text style={styles.emptyTitle}>No reminders yet</Text>
            <Text style={styles.emptySubtitle}>
              Reminders set on your shopping lists will appear here and notify your phone.
            </Text>
          </View>
        ) : (
          <FlatList
            data={reminders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={renderReminderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.gold}
                colors={[colors.gold]}
              />
            }
          />
        )}
      </View>
    </>
  );
}

const makeStyles = (colors, isDark) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    list: {
      padding: spacing.md,
      paddingBottom: spacing.xl * 2,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm + 4,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    cardPressed: {
      opacity: 0.85,
    },
    iconBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#2B2412' : '#FBF7EA',
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm + 4,
    },
    iconBadgePast: {
      backgroundColor: isDark ? '#243048' : '#F0F4F8',
      borderColor: colors.border,
    },
    cardContent: {
      flex: 1,
      marginRight: spacing.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    cardTitle: {
      ...typography.label,
      fontSize: 16,
      color: colors.text,
      flex: 1,
      marginRight: spacing.sm,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
    statusUpcoming: {
      backgroundColor: isDark ? '#3D3117' : '#F7ECC8',
    },
    statusPast: {
      backgroundColor: isDark ? '#252F42' : '#EAECEF',
    },
    statusText: {
      ...typography.small,
      fontSize: 11,
      fontWeight: '700',
    },
    statusTextUpcoming: {
      color: colors.gold,
    },
    statusTextPast: {
      color: colors.textSecondary,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    dateText: {
      ...typography.small,
      color: colors.textSecondary,
      fontSize: 13,
    },
    tagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
    },
    timingPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#243048' : '#F0F4F8',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    timingPillText: {
      ...typography.small,
      fontSize: 12,
      color: colors.navy,
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    emptyIconBadge: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: isDark ? '#1C273C' : '#F2F4F8',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    emptyTitle: {
      ...typography.heading,
      fontSize: 18,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    emptySubtitle: {
      ...typography.body,
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });