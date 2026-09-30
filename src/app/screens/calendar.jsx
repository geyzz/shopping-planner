import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, colors, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Collect every text value from any JSON / array / object
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

// True if the list title or any item text contains the (lowercase) query
const matchesQuery = (item, query) =>
  (item.title ?? '').toLowerCase().includes(query) ||
  getItemTexts(item).some((text) => text.toLowerCase().includes(query));

export default function CalendarPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [viewDate, setViewDate] = useState(new Date()); // controls which month is shown
  const [selectedDate, setSelectedDate] = useState(new Date()); // controls which day's lists show below
  const [lists, setLists] = useState([]);

  const query = searchText.trim().toLowerCase();

  // Reload lists every time this screen gains focus
  useFocusEffect(
    useCallback(() => {
      const fetchLists = async () => {
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

  // When searching, jump the calendar to the date of a matching list
  useEffect(() => {
    if (!query) return;

    const matchDates = lists
      .filter((item) => item.details?.reminderDate && matchesQuery(item, query))
      .map((item) => new Date(item.details.reminderDate))
      .filter((d) => !isNaN(d));

    if (matchDates.length === 0) return;

    // Already on a day that has a match? Stay put while the user keeps typing
    if (matchDates.some((d) => isSameDay(d, selectedDate))) return;

    // Otherwise jump to the match closest to today
    const today = new Date();
    matchDates.sort((a, b) => Math.abs(a - today) - Math.abs(b - today));
    const target = matchDates[0];

    setSelectedDate(target);
    setViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, lists]);

  // Build the grid of days for the currently viewed month, padded with
  // leading blanks so weekdays line up correctly.
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < startWeekday; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [viewDate]);

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
      pathname: '/screens/create_edit',
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
      <Text style={styles.logo}>Plan_.ed</Text>

      <View style={styles.headerRow}>
        <View style={styles.monthYearWrapper}>
          <Pressable onPress={goToPreviousMonth} style={styles.monthArrow}>
            <Feather name="chevron-left" size={20} color={colors.navy} />
          </Pressable>
          <Text style={styles.monthYearText}>
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </Text>
          <Pressable onPress={goToNextMonth} style={styles.monthArrow}>
            <Feather name="chevron-right" size={20} color={colors.navy} />
          </Pressable>
        </View>

        <View style={styles.searchWrapper}>
          <Feather name="search" size={16} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search title or items"
            placeholderTextColor={colors.placeholder}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {calendarDays.map((date, index) => {
          if (!date) {
            return <View key={`blank-${index}`} style={styles.dayCell} />;
          }

          const today = isSameDay(date, new Date());
          const selected = isSameDay(date, selectedDate);
          const listsOnDay = listsForDate(date);
          const hasLists = listsOnDay.length > 0;
          // While searching, mark every day that has a matching list
          const isMatch = !!query && listsOnDay.some((item) => matchesQuery(item, query));

          return (
            <Pressable
              key={date.toISOString()}
              style={styles.dayCell}
              onPress={() => setSelectedDate(date)}
            >
              <View
                style={[
                  styles.dayCircle,
                  isMatch && styles.dayCircleMatch,
                  selected && styles.dayCircleSelected,
                  today && styles.dayCircleToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isMatch && styles.dayTextMatch,
                    selected && styles.dayTextHighlighted,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </View>
              {hasLists && <View style={styles.dayDot} />}
            </Pressable>
          );
        })}
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
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.replace('/screens/home')}>
          <Feather name="home" size={24} color={colors.textSecondary} />
          <Text style={styles.navLabel}>Home</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('/screens/settings')}>
          <Feather name="user" size={24} color={colors.textSecondary} />
          <Text style={styles.navLabel}>Profile</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace('/screens/calendar')}>
          <Feather name="calendar" size={24} color={colors.navy} />
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  logo: {
    ...typography.heading,
    color: colors.navy,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  monthYearWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthArrow: {
    padding: spacing.sm / 2,
  },
  monthYearText: {
    ...typography.label,
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginHorizontal: spacing.sm / 2,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    width: '42%',
  },
  searchIcon: {
    marginRight: spacing.sm / 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm / 2,
    fontSize: 13,
    color: colors.text,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm / 2,
  },
  weekdayText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm / 2,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: colors.navy,
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: colors.gold,
  },
  dayCircleMatch: {
    backgroundColor: colors.gold,
  },
  dayText: {
    fontSize: 13,
    color: colors.text,
  },
  dayTextMatch: {
    color: colors.navy,
    fontWeight: '700',
  },
  dayTextHighlighted: {
    color: colors.white,
    fontWeight: '700',
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginTop: 2,
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
    paddingBottom: 120,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
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