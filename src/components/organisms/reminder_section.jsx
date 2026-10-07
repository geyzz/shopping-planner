import Tag from '@/components/atoms/tag';
import DateField from '@/components/molecules/date_field';
import SectionHeader from '@/components/molecules/section_header';
import SetTime from '@/components/molecules/set_time';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const TIMING_OPTIONS = [
  { id: 'before', label: 'Before' },
  { id: 'on', label: 'On date' },
  { id: 'after', label: 'After' },
];

export default function ReminderSection({
  types = [],
  type = null,
  onTypeChange,
  date = null,
  onDateChange,
  timing = 'on',
  onTimingChange,
  expanded = false,
  onToggle,
  readOnly = false,
}) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  const selected = types.find((t) => t.id === type);

  const dateObj = date ? (date instanceof Date ? date : new Date(date)) : null;
  const isValidDate = dateObj instanceof Date && !isNaN(dateObj.getTime());
  const formattedDate = isValidDate
    ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  const formattedTime = isValidDate
    ? dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null;

  if (readOnly) {
    if (!selected && !formattedDate) {
      return (
        <View style={styles.card}>
          <SectionHeader title="Reminder" />
          <Text style={styles.emptyText}>No reminder set</Text>
        </View>
      );
    }

    const timingLabel =
      timing === 'before'
        ? 'Before date'
        : timing === 'after'
        ? 'After date'
        : 'On date';

    return (
      <View style={styles.card}>
        <SectionHeader title="Reminder" />

        <View style={styles.readOnlyContainer}>
          {/* Row 1: Tag */}
          <View style={styles.readOnlySection}>
            {selected ? (
              <Tag label={selected.label} icon={selected.icon} selected />
            ) : (
              <Text style={styles.emptyText}>No category</Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Row 2: Date */}
          <View style={styles.readOnlySection}>
            <View style={styles.readOnlyItem}>
              <Feather name="calendar" size={16} color={colors.navy} />
              <Text style={styles.readOnlyItemText}>{formattedDate || 'No date set'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 3: Time on date */}
          <View style={styles.readOnlySection}>
            <View style={styles.timeOnDateRow}>
              <View style={styles.readOnlyItem}>
                <Feather name="clock" size={16} color={colors.navy} />
                <Text style={styles.readOnlyItemText}>{formattedTime || 'No time set'}</Text>
              </View>
              {timing && (
                <View style={styles.timingBadge}>
                  <Feather name="bell" size={12} color={colors.gold} />
                  <Text style={styles.timingBadgeText}>{timingLabel}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }

  const timingLabel =
    timing === 'before'
      ? 'Before date'
      : timing === 'after'
      ? 'After date'
      : 'On date';

  return (
    <View style={styles.card}>
      <SectionHeader
        title="Reminder"
        collapsible
        expanded={expanded}
        onToggle={onToggle}
      />

      {!expanded && (selected || formattedDate) && (
        <View style={styles.readOnlyContainer}>
          <View style={styles.readOnlySection}>
            {selected && (
              <Tag label={selected.label} icon={selected.icon} selected />
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.readOnlySection}>
            <View style={styles.readOnlyItem}>
              <Feather name="calendar" size={16} color={colors.navy} />
              <Text style={styles.readOnlyItemText}>{formattedDate || 'No date set'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.readOnlySection}>
            <View style={styles.timeOnDateRow}>
              <View style={styles.readOnlyItem}>
                <Feather name="clock" size={16} color={colors.navy} />
                <Text style={styles.readOnlyItemText}>{formattedTime || 'No time set'}</Text>
              </View>
              {timing && (
                <View style={styles.timingBadge}>
                  <Feather name="bell" size={12} color={colors.gold} />
                  <Text style={styles.timingBadgeText}>{timingLabel}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {expanded && (
        <View style={styles.sectionBody}>
          <View style={styles.tagRow}>
            {types.map((t) => (
              <Tag
                key={t.id}
                label={t.label}
                icon={t.icon}
                selected={type === t.id}
                onPress={() => onTypeChange?.(type === t.id ? null : t.id)}
              />
            ))}
          </View>

          <View style={styles.dateTimeColumn}>
            <DateField value={date} editable onChange={onDateChange} />
            <SetTime value={date} editable onChange={onDateChange} />

            <View style={styles.timingContainer}>
              <View style={styles.timingHeader}>
                <Feather name="bell" size={14} color={colors.navy} />
                <Text style={styles.timingTitle}>Notify:</Text>
              </View>
              <View style={styles.timingOptionsRow}>
                {TIMING_OPTIONS.map((opt) => {
                  const isSelected = (timing || 'on') === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      style={[styles.timingChip, isSelected && styles.timingChipSelected]}
                      onPress={() => onTimingChange?.(opt.id)}
                    >
                      <Text
                        style={[
                          styles.timingChipText,
                          isSelected && styles.timingChipTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.timingHint}>
                {(timing || 'on') === 'before'
                  ? 'Notify 1 day before at the set time'
                  : timing === 'after'
                  ? 'Notify 1 day after at the set time'
                  : 'Notify on the scheduled date and time'}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors, isDark) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      backgroundColor: colors.white,
      marginTop: spacing.md,
    },
    sectionBody: {
      marginTop: spacing.sm,
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dateTimeColumn: {
      flexDirection: 'column',
      marginTop: spacing.sm / 2,
    },
    timingContainer: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    timingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm / 2,
    },
    timingTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.navy,
      marginLeft: 6,
    },
    timingOptionsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    timingChip: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: isDark ? '#1F293D' : '#F7F8FA',
    },
    timingChipSelected: {
      backgroundColor: colors.navy,
      borderColor: colors.navy,
    },
    timingChipText: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '500',
    },
    timingChipTextSelected: {
      color: isDark ? '#1B2A4A' : '#FFFFFF',
      fontWeight: '700',
    },
    timingHint: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 6,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.sm,
    },
    readOnlyContainer: {
      marginTop: spacing.sm,
    },
    readOnlySection: {
      paddingVertical: 2,
    },
    timeOnDateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    readOnlyItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    readOnlyItemText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: spacing.sm,
      fontWeight: '500',
    },
    timingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      paddingVertical: 3,
      paddingHorizontal: spacing.sm,
      backgroundColor: isDark ? '#243048' : '#F0F4F8',
    },
    timingBadgeText: {
      fontSize: 12,
      color: colors.text,
      marginLeft: 4,
      fontWeight: '600',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: spacing.sm,
    },
  });