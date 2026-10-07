import AppLogo from '@/components/atoms/app_logo';
import SearchBar from '@/components/molecules/search_bar';
import BottomNavigation from '@/components/organisms/bottom_nav';
import CalendarView from '@/components/organisms/calendar_view';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const collectStrings = (value, out = []) => {
  if (value == null) return out;
  if (typeof value === 'string') {
    const t = value.trim();
    if (t.startsWith('[') || t.startsWith('{')) {
      try {
        collectStrings(JSON.parse(t), out);
        return out;
      } catch {}
    }
    if (t) out.push(t);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectStrings(v, out));
  } else if (typeof value === 'object') {
    Object.values(value).forEach((v) => collectStrings(v, out));
  }
  return out;
};

const getItemTexts = (note) => collectStrings(note.details);

const matchesQuery = (item, query) =>
  (item.title ?? '').toLowerCase().includes(query) ||
  getItemTexts(item).some((text) => text.toLowerCase().includes(query));

export default function CalendarPage() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState('');
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [lists, setLists] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const query = searchText.trim().toLowerCase();

  useFocusEffect(
    useCallback(() => {
      const fetchLists = async () => {
        const cachedAvatar = await AsyncStorage.getItem('user_avatar_uri').catch(() => null);
        if (cachedAvatar) setAvatarUrl(cachedAvatar);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.user_metadata?.avatar_url) {
          setAvatarUrl(session.user.user_metadata.avatar_url);
        }

        const { data, error } = await supabase
          .from('lists')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.log('Error fetching lists:', error.message);
          return;
        }
        if (data) setLists(data);
      };

      fetchLists();
    }, [])
  );

  useEffect(() => {
    if (!query) return;

    const matchDates = lists
      .filter((item) => item.details?.reminderDate && matchesQuery(item, query))
      .map((item) => new Date(item.details.reminderDate))
      .filter((d) => !isNaN(d));

    if (matchDates.length === 0) return;
    if (matchDates.some((d) => isSameDay(d, selectedDate))) return;

    const today = new Date();
    matchDates.sort((a, b) => Math.abs(a - today) - Math.abs(b - today));
    const target = matchDates[0];

    const frame = requestAnimationFrame(() => {
      setSelectedDate(target);
      setViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, lists]);

  const goToPreviousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const listsForDate = (date) =>
    lists.filter((item) => {
      const reminderDate = item.details?.reminderDate;
      if (!reminderDate) return false;
      return isSameDay(new Date(reminderDate), date);
    });

  const filteredListsForSelectedDate = listsForDate(selectedDate).filter(
    (item) => !query || matchesQuery(item, query)
  );

  const handleViewList = (item) => {
    router.push({
      pathname: '/screens/view_list',
      params: { list: JSON.stringify(item) },
    });
  };

  const formatSelectedDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const renderListItem = ({ item }) => (
    <View style={styles.listCard}>
      <View style={styles.listCardInfo}>
        <Feather name="file-text" size={18} color={colors.navy} />
        <Text style={styles.listCardTitle} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
      <Pressable style={styles.viewListButton} onPress={() => handleViewList(item)}>
        <Text style={styles.viewListButtonText}>View list</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.headerRow, { marginTop: insets.top + spacing.sm }]}>
        <View style={styles.logoCard}>
          <AppLogo />
        </View>
        <Pressable
          style={styles.notifButton}
          onPress={() => router.push('/screens/notif')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Feather name="bell" size={20} color={colors.navy} />
        </Pressable>
      </View>

      <View style={{ marginTop: spacing.md }}>
        <CalendarView
          viewDate={viewDate}
          selectedDate={selectedDate}
          onPrevMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onSelectDate={setSelectedDate}
          listsForDate={listsForDate}
          query={query ? (item) => matchesQuery(item, query) : null}
          headerRight={
            <View style={styles.searchWrapper}>
              <SearchBar
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search"
                compact
              />
            </View>
          }
        />
      </View>

      <View style={styles.selectedDateSection}>
        <Text style={styles.selectedDateText}>{formatSelectedDate(selectedDate)}</Text>

        {filteredListsForSelectedDate.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {query ? 'No matching lists for this day' : 'No lists for this day'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredListsForSelectedDate}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderListItem}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: Math.max(insets.bottom, spacing.sm) + 140 },
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <BottomNavigation
        activeTab="calendar"
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
      paddingHorizontal: spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.md + 14,
      height: 48,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.full,
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    notifButton: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    searchWrapper: {
      flex: 1,
      minWidth: 0,
      marginLeft: spacing.sm,
    },
    selectedDateSection: {
      flex: 1,
      marginTop: spacing.lg,
    },
    selectedDateText: {
      ...typography.label,
      fontSize: 15,
      fontWeight: '700',
      color: colors.navy,
      marginBottom: spacing.sm,
    },
    emptyState: {
      alignItems: 'center',
      paddingTop: spacing.lg,
    },
    emptyStateText: {
      ...typography.label,
      color: colors.textSecondary,
    },
    listContent: {
      paddingBottom: 150,
    },
    listCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
    listCardInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },
    listCardTitle: {
      fontSize: 14,
      color: colors.text,
      marginLeft: spacing.sm / 2,
      flexShrink: 1,
    },
    viewListButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm / 2,
      paddingHorizontal: spacing.sm,
    },
    viewListButtonText: {
      fontSize: 12,
      color: colors.navy,
      fontWeight: '600',
    },
  });