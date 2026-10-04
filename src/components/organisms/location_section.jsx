import LocationCard from '@/components/molecules/location_card';
import SectionHeader from '@/components/molecules/section_header';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/theme';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function LocationSection({
  locations = [],
  recommendations = {},
  value = null,
  onChange,
  expanded = false,
  onToggle,
  readOnly = false,
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (readOnly) {
    const selected = locations.find((loc) => loc.id === value);
    if (!selected) return null;

    return (
      <View style={styles.section}>
        <SectionHeader title="Location" />
        <LocationCard image={selected.image} address={selected.address ?? selected.name} />
      </View>
    );
  }

  // Best mall(s) for the current shopping list, shown whether or not a mall is selected
  const ranked = Object.values(recommendations).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
  const top = ranked[0];
  const bestMalls = top ? ranked.filter((r) => r.count === top.count) : [];
  const current = value ? recommendations[value] : null;

  let note = null;
  if (top && value) {
    if (!current) {
      note = 'Your selected mall has none of these items.';
    } else if (current.count < top.count) {
      note = `Your selected mall has ${current.count}/${current.total} items. Missing: ${current.missing.join(', ')}`;
    }
  }

  return (
    <View style={styles.section}>
      <SectionHeader
        title="Location"
        collapsible
        expanded={expanded}
        onToggle={onToggle}
      />

      {top && (
        <View style={styles.summary}>
          <Text style={styles.summaryBest}>
            {`★ ${top.count === top.total ? 'All items at' : 'Best match:'} ${bestMalls
              .map((m) => m.name)
              .join(', ')} · ${top.count}/${top.total} items`}
          </Text>
          {note ? <Text style={styles.summaryNote}>{note}</Text> : null}
        </View>
      )}

      {expanded && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cards}
        >
          {[...locations]
            .sort(
              (a, b) =>
                (recommendations[b.id]?.count ?? 0) - (recommendations[a.id]?.count ?? 0)
            )
            .map((loc) => {
              const isSelected = value === loc.id;
              const rec = recommendations[loc.id];
              return (
                <LocationCard
                  key={loc.id}
                  size="small"
                  image={loc.image}
                  address={loc.address ?? loc.name}
                  selected={isSelected}
                  recommended={rec?.best}
                  badge={rec ? `${rec.count}/${rec.total} items` : undefined}
                  onSelect={() => onChange?.(isSelected ? null : loc.id)}
                />
              );
            })}
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    section: {
      marginTop: spacing.lg,
    },
    cards: {
      paddingTop: spacing.sm,
      paddingRight: spacing.md,
    },
    summary: {
      marginTop: spacing.sm / 2,
    },
    summaryBest: {
      color: colors.gold,
      fontSize: 13,
      fontWeight: '700',
    },
    summaryNote: {
      color: colors.text,
      opacity: 0.7,
      fontSize: 12,
      marginTop: 2,
    },
  });