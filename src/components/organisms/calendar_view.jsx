import { useAppTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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

export default function CalendarView({
  viewDate,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  listsForDate,
  query,
  headerRight,
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  }, [viewDate]);

  return (
    <View>
      <View style={styles.monthYearWrapper}>
        <View style={styles.monthNav}>
          <Pressable onPress={onPrevMonth} style={styles.monthArrow}>
            <Feather name="chevron-left" size={20} color={colors.navy} />
          </Pressable>
          <Text style={styles.monthYearText} numberOfLines={1}>
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </Text>
          <Pressable onPress={onNextMonth} style={styles.monthArrow}>
            <Feather name="chevron-right" size={20} color={colors.navy} />
          </Pressable>
        </View>

        {headerRight}
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {calendarDays.map((date, index) => {
          if (!date) return <View key={`blank-${index}`} style={styles.dayCell} />;

          const today = isSameDay(date, new Date());
          const selected = isSameDay(date, selectedDate);
          const listsOnDay = listsForDate(date);
          const hasLists = listsOnDay.length > 0;
          const isMatch = !!query && listsOnDay.some((item) => query(item));

          return (
            <Pressable
              key={date.toISOString()}
              style={styles.dayCell}
              onPress={() => onSelectDate(date)}
            >
              <View
                style={[
                  styles.dayCircle,
                  isMatch && styles.dayCircleMatch,
                  selected && styles.dayCircleSelected,
                  today && styles.dayCircleToday,
                ]}
              >
                <Text style={[styles.dayText, isMatch && styles.dayTextMatch, selected && styles.dayTextHighlighted]}>
                  {date.getDate()}
                </Text>
              </View>
              {hasLists && <View style={styles.dayDot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    monthYearWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    monthNav: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
    },
    monthArrow: {
      padding: spacing.sm / 2,
    },
    monthYearText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.navy,
      marginHorizontal: spacing.sm / 2,
    },
    weekdayRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing.sm,
    },
    weekdayText: {
      fontSize: 12,
      color: colors.textSecondary,
      width: 32,
      textAlign: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: spacing.sm,
    },
    dayCell: {
      width: `${100 / 7}%`,
      alignItems: 'center',
      paddingVertical: spacing.sm / 2,
    },
    dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    },
    dayCircleSelected: {
      backgroundColor: colors.navy,
    },
    dayCircleToday: {
      borderWidth: 1,
      borderColor: colors.gold,
    },
    dayCircleMatch: {
      backgroundColor: colors.gold,
    },
    dayText: {
      fontSize: 13,
      color: colors.text,
    },
    dayTextHighlighted: {
      color: colors.white,
    },
    dayTextMatch: {
      color: colors.navy,
      fontWeight: '700',
    },
    dayDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.gold,
      marginTop: 2,
    },
  });