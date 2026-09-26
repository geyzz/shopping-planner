import { supabase } from '@/lib/supabase';
import { borderRadius, colors, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const REMINDER_TYPES = {
  gift: { label: 'Gift', icon: 'gift' },
  shopping: { label: 'Shopping', icon: 'shopping-bag' },
  grocery: { label: 'Grocery', icon: 'shopping-cart' },
  food: { label: 'Food', icon: 'coffee' },
};

const LOCATIONS = {
  sm_city_clark: 'SM City Clark',
  marquee_mall: 'Marquee Mall',
  nepo_mall: 'Nepo Mall',
  newpoint_mall: 'Newpoint Mall',
};

export default function ViewListPage() {
  const router = useRouter();
  const { list } = useLocalSearchParams();

  const [noteId, setNoteId] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedReminderType, setSelectedReminderType] = useState(null);
  const [reminderDate, setReminderDate] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [budget, setBudget] = useState('');

  useEffect(() => {
    if (!list) return;
    try {
      const parsed = JSON.parse(list);
      setNoteId(parsed.id ?? null);
      setTitle(parsed.title ?? '');

      const details = parsed.details ?? parsed;
      setSelectedReminderType(details.reminderType ?? null);
      setReminderDate(details.reminderDate ? new Date(details.reminderDate) : null);
      setSelectedLocation(details.location ?? null);
      setShoppingItems(
        (details.shoppingItems ?? []).map((item) => ({ checked: false, ...item }))
      );
      setBudget(details.budget ?? '');
    } catch (e) {
      console.warn('Failed to parse list param', e);
    }
  }, [list]);

  const uncheckedItems = shoppingItems.filter((item) => !item.checked);
  const checkedItems = shoppingItems.filter((item) => item.checked);

  const totalCost = shoppingItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const remainingBudget = (parseFloat(budget) || 0) - totalCost;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/screens/home');
    }
  };

  const persistItems = async (updatedItems) => {
    if (!noteId) return;

    const details = {
      reminderType: selectedReminderType,
      reminderDate: reminderDate ? reminderDate.toISOString() : null,
      location: selectedLocation,
      shoppingItems: updatedItems,
      budget,
      totalCost: updatedItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    };

    const { error } = await supabase.from('lists').update({ details }).eq('id', noteId);

    if (error) {
      console.log('Error updating checklist:', error.message);
      Alert.alert('Update failed', error.message);
    }
  };

  const handleToggleItem = (id) => {
    const updatedItems = shoppingItems.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setShoppingItems(updatedItems);
    persistItems(updatedItems);
  };

  const handleEdit = () => {
    router.push({
      pathname: '/screens/create_edit',
      params: {
        list: JSON.stringify({
          id: noteId,
          title,
          details: {
            reminderType: selectedReminderType,
            reminderDate: reminderDate ? reminderDate.toISOString() : null,
            location: selectedLocation,
            shoppingItems,
            budget,
            totalCost,
          },
        }),
      },
    });
  };

  const reminderInfo = selectedReminderType ? REMINDER_TYPES[selectedReminderType] : null;
  const locationName = selectedLocation ? LOCATIONS[selectedLocation] : null;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color={colors.navy} />
        </Pressable>
        <Text style={styles.titleText} numberOfLines={1}>
          {title || 'Untitled'}
        </Text>
        <Pressable style={styles.editButton} onPress={handleEdit}>
          <Feather name="edit-2" size={16} color={colors.navy} />
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {reminderInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder</Text>
            <View style={styles.reminderDisplayRow}>
              <View style={styles.reminderTypeChip}>
                <Feather name={reminderInfo.icon} size={16} color={colors.white} />
                <Text style={styles.reminderTypeChipText}>{reminderInfo.label}</Text>
              </View>
              {reminderDate && (
                <View style={styles.dateDisplay}>
                  <Feather name="calendar" size={14} color={colors.navy} />
                  <Text style={styles.dateDisplayText}>
                    {reminderDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {locationName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationDisplayRow}>
              <View style={styles.locationPreview} />
              <Text style={styles.locationDisplayName}>{locationName}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shopping List</Text>

          {shoppingItems.length === 0 ? (
            <Text style={styles.emptyText}>No items added</Text>
          ) : (
            <>
              {uncheckedItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.checklistRow}
                  onPress={() => handleToggleItem(item.id)}
                >
                  <View style={styles.checkboxOuter} />
                  <Text style={styles.checklistItemText}>{item.name}</Text>
                </Pressable>
              ))}

              {checkedItems.length > 0 && (
                <>
                  <View style={styles.checkedDivider}>
                    <View style={styles.checkedDividerLine} />
                    <Text style={styles.checkedDividerText}>Checked List</Text>
                    <View style={styles.checkedDividerLine} />
                  </View>

                  {checkedItems.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.checklistRow}
                      onPress={() => handleToggleItem(item.id)}
                    >
                      <View style={styles.checkboxOuterChecked}>
                        <Feather name="check" size={12} color={colors.white} />
                      </View>
                      <Text style={styles.checklistItemTextChecked}>{item.name}</Text>
                    </Pressable>
                  ))}
                </>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Estimation</Text>

          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Budget</Text>
            <Text style={styles.budgetValue}>₱{(parseFloat(budget) || 0).toFixed(2)}</Text>
          </View>

          {shoppingItems.map((item) => (
            <View key={item.id} style={styles.costItemRow}>
              <Text style={styles.costItemName}>{item.name}</Text>
              <Text style={styles.costItemPrice}>₱{(parseFloat(item.price) || 0).toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Cost Estimation</Text>
            <Text style={styles.totalValue}>₱{totalCost.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Remaining Budget</Text>
            <Text
              style={[styles.totalValue, remainingBudget < 0 && styles.totalValueNegative]}
            >
              ₱{remainingBudget.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  titleText: {
    flex: 1,
    ...typography.heading,
    fontSize: 20,
    color: colors.navy,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm / 2,
    paddingHorizontal: spacing.sm,
  },
  editButtonText: {
    fontSize: 13,
    color: colors.navy,
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl ?? spacing.lg * 2,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    fontSize: 16,
    color: colors.navy,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  reminderDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm / 2,
    paddingHorizontal: spacing.sm,
  },
  reminderTypeChipText: {
    fontSize: 13,
    color: colors.white,
    marginLeft: spacing.sm / 2,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  dateDisplayText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm / 2,
  },
  locationDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPreview: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm ?? 4,
    backgroundColor: colors.border,
    marginRight: spacing.sm,
  },
  locationDisplayName: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkboxOuter: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.navy,
    marginRight: spacing.sm,
  },
  checkboxOuterChecked: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.navy,
    borderColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checklistItemText: {
    fontSize: 14,
    color: colors.text,
  },
  checklistItemTextChecked: {
    fontSize: 14,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
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
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  budgetLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  budgetValue: {
    fontSize: 14,
    color: colors.navy,
    fontWeight: '700',
  },
  costItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm / 2,
  },
  costItemName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  costItemPrice: {
    fontSize: 14,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm / 2,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 14,
    color: colors.navy,
    fontWeight: '700',
  },
  totalValueNegative: {
    color: colors.error,
  },
});