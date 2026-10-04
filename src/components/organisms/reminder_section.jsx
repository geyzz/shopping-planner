import Tag from '@/components/atoms/tag';
import DateField from '@/components/molecules/date_field';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// types:        [{ id, label, icon }]
// type:         selected type id or null
// onTypeChange: (id | null) => void
// date:         Date or null
// onDateChange: (Date) => void
// expanded / onToggle: held by the screen, same as the other sections
// readOnly:     view screen. Shows the chosen type and date, nothing if no type.
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
        <Text style={[styles.sectionTitle, styles.sectionTitleStatic]}>Reminder</Text>
        <View style={styles.displayRow}>
          <Tag label={selected.label} icon={selected.icon} selected />
          {date && <DateField value={date} editable={false} />}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Pressable style={styles.sectionHeader} onPress={onToggle}>
        <Text style={styles.sectionTitle}>Reminder</Text>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.navy}
        />
      </Pressable>

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

          <DateField value={date} editable onChange={onDateChange} />
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
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      ...typography.label,
      fontSize: 16,
      color: colors.navy,
      fontWeight: '700',
    },
    sectionTitleStatic: {
      marginBottom: spacing.sm,
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
  });