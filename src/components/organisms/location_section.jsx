import LocationCard from '@/components/molecules/location_card';
import SectionHeader from '@/components/molecules/section_header';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/theme';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function LocationSection({
  locations = [],
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

  return (
    <View style={styles.section}>
      <SectionHeader
        title="Location"
        collapsible
        expanded={expanded}
        onToggle={onToggle}
      />

      {expanded && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cards}
        >
          {locations.map((loc) => {
            const isSelected = value === loc.id;
            return (
              <LocationCard
                key={loc.id}
                size="small"
                image={loc.image}
                address={loc.address ?? loc.name}
                selected={isSelected}
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
  });