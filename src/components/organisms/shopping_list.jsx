import ItemRow from '@/components/molecules/item_row';
import SectionHeader from '@/components/molecules/section_header';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ShoppingList({
  items = [],
  onAdd,
  onDelete,
  onToggle,
  readOnly = false,
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [newItemText, setNewItemText] = useState('');

  const handleAdd = () => {
    const name = newItemText.trim();
    if (!name) return;
    onAdd?.(name);
    setNewItemText('');
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

      {items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <Text style={styles.itemText}>{item.name}</Text>
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
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: spacing.sm,
    },
    itemText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
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