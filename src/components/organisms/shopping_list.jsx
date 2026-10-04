import ItemRow from '@/components/molecules/item_row';
import SectionHeader from '@/components/molecules/section_header';
import { searchItems } from '@/lib/mall_data';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const formatShops = (shops = []) => {
  if (!shops.length) return '';
  const shown = shops.slice(0, 3).join(', ');
  return shops.length > 3 ? `${shown} +${shops.length - 3}` : shown;
};

const formatPrice = (value) => {
  if (value == null) return '';
  if (value === 0) return 'Free';
  return `₱${String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export default function ShoppingList({
  items = [],
  onAdd,
  onDelete,
  onToggle,
  mallSlug = null,
  readOnly = false,
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [newItemText, setNewItemText] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Look up matching items from the database while typing
  useEffect(() => {
    if (readOnly) return;

    const q = newItemText.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      const results = await searchItems(q, mallSlug);
      if (!cancelled) setSuggestions(results);
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [newItemText, mallSlug, readOnly]);

  const handleAdd = () => {
    const name = newItemText.trim();
    if (!name) return;
    const match = suggestions.find((s) => s.name.toLowerCase() === name.toLowerCase());
    onAdd?.(name, match?.shops ?? [], match?.price ?? null);
    setNewItemText('');
    setSuggestions([]);
  };

  const handlePickSuggestion = (suggestion) => {
    onAdd?.(suggestion.name, suggestion.shops, suggestion.price);
    setNewItemText('');
    setSuggestions([]);
  };

  if (readOnly) {
    const unchecked = items.filter((item) => !item.checked);
    const checked = items.filter((item) => item.checked);

    return (
      <View style={styles.section}>
        <SectionHeader title="Shopping List" />

        {items.length === 0 ? (
          <Text style={styles.emptyText}>No items added</Text>
        ) : (
          <>
            {unchecked.map((item) => (
              <ItemRow
                key={item.id}
                name={item.name}
                subtitle={formatShops(item.shops)}
                checked={!!item.checked}
                showCheckbox
                onToggle={() => onToggle?.(item.id)}
              />
            ))}

            {checked.length > 0 && (
              <>
                <View style={styles.checkedDivider}>
                  <View style={styles.checkedDividerLine} />
                  <Text style={styles.checkedDividerText}>Checked List</Text>
                  <View style={styles.checkedDividerLine} />
                </View>
                {checked.map((item) => (
                  <ItemRow
                    key={item.id}
                    name={item.name}
                    subtitle={formatShops(item.shops)}
                    checked={!!item.checked}
                    showCheckbox
                    onToggle={() => onToggle?.(item.id)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <SectionHeader title="Shopping List" />

      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Add an item"
          placeholderTextColor={colors.placeholder}
          value={newItemText}
          onChangeText={setNewItemText}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable accessibilityRole="button" style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionBox}>
          {suggestions.map((s, index) => (
            <Pressable
              key={s.id}
              style={[styles.suggestionRow, index === suggestions.length - 1 && styles.suggestionLast]}
              onPress={() => handlePickSuggestion(s)}
            >
              <View style={styles.suggestionTop}>
                <Text style={styles.suggestionName} numberOfLines={1}>
                  {s.name}
                </Text>
                {s.price != null && (
                  <Text style={styles.suggestionPrice}>{formatPrice(s.price)}</Text>
                )}
              </View>
              {s.shops.length > 0 && (
                <Text style={styles.suggestionShops} numberOfLines={1}>
                  {formatShops(s.shops)}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      )}

      {items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <View style={styles.itemTextWrapper}>
            <Text style={styles.itemText}>{item.name}</Text>
            {item.shops?.length > 0 && (
              <Text style={styles.itemShops} numberOfLines={1}>
                {formatShops(item.shops)}
              </Text>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${item.name}`}
            hitSlop={8}
            onPress={() => onDelete?.(item.id)}
          >
            <Feather name="trash-2" size={18} color={colors.error} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    section: {
      marginTop: spacing.lg,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    addRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    addInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md - 4,
      fontSize: 14,
      color: colors.text,
    },
    addButton: {
      marginLeft: spacing.sm,
      backgroundColor: colors.gold,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    addButtonText: {
      color: colors.onGold,
      fontWeight: '600',
      fontSize: 14,
    },
    suggestionBox: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.white,
      marginTop: spacing.sm,
      overflow: 'hidden',
    },
    suggestionRow: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md - 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    suggestionLast: {
      borderBottomWidth: 0,
    },
    suggestionTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    suggestionName: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    suggestionPrice: {
      marginLeft: spacing.sm,
      fontSize: 14,
      color: colors.navy,
      fontWeight: '700',
    },
    suggestionShops: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: spacing.sm,
    },
    itemTextWrapper: {
      flex: 1,
    },
    itemText: {
      fontSize: 14,
      color: colors.text,
    },
    itemShops: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    checkedDivider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.md,
    },
    checkedDividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    checkedDividerText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '700',
      marginHorizontal: spacing.sm,
    },
  });