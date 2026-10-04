import Tag from '@/components/atoms/tag';
import DateField from '@/components/molecules/date_field';
import SectionHeader from '@/components/molecules/section_header';
import SetTime from '@/components/molecules/set_time';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/theme';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

export default function ReminderSection({
  types = [],
  type = null,
  onTypeChange,
  date = null,
  onDateChange,
  expanded = false,
  onToggle,
  readOnly = false,
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (readOnly) {
    const selected = types.find((t) => t.id === type);
    if (!selected) return null;

    return (
      <View style={styles.section}>
        <SectionHeader title="Reminder" />
        <View style={styles.displayRow}>
          <Tag label={selected.label} icon={selected.icon} selected />
        </View>
        {date && (
          <View style={styles.dateTimeRow}>
            <DateField value={date} editable={false} />
            <SetTime value={date} editable={false} />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <SectionHeader
        title="Reminder"
        collapsible
        expanded={expanded}
        onToggle={onToggle}
      />

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

          <View style={styles.dateTimeRow}>
            <DateField value={date} editable onChange={onDateChange} />
            <SetTime value={date} editable onChange={onDateChange} />
          </View>
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    section: {
      marginTop: spacing.lg,
    },
    sectionBody: {
      marginTop: spacing.sm,
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    displayRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateTimeRow: {
      flexDirection: 'row',
      gap: spacing.sm / 2,
      marginTop: spacing.sm / 2,
    },
  });