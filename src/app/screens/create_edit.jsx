import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '@/theme/theme';

const REMINDER_TYPES = [
  { id: 'gift', label: 'Gift', icon: 'gift' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag' },
  { id: 'grocery', label: 'Grocery', icon: 'shopping-cart' },
  { id: 'food', label: 'Food', icon: 'coffee' },
];

const LOCATIONS = [
  { id: 'sm_city_clark', name: 'SM City Clark' },
  { id: 'marquee_mall', name: 'Marquee Mall' },
  { id: 'nepo_mall', name: 'Nepo Mall' },
  { id: 'newpoint_mall', name: 'Newpoint Mall' },
];

export default function CreateEditPage() {
  const router = useRouter();
  const { list } = useLocalSearchParams();

  const [noteId, setNoteId] = useState(null);
  const [originalDateCreated, setOriginalDateCreated] = useState(null);
  const [title, setTitle] = useState('');

  const [reminderExpanded, setReminderExpanded] = useState(false);
  const [selectedReminderType, setSelectedReminderType] = useState(null);
  const [reminderDate, setReminderDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [locationExpanded, setLocationExpanded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [shoppingItems, setShoppingItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');

  const [costExpanded, setCostExpanded] = useState(false);
  const [budget, setBudget] = useState('');

  // If we arrived here from Home with an existing note, pre-fill the form.
  useEffect(() => {
    if (!list) return;
    try {
      const parsed = JSON.parse(list);
      setNoteId(parsed.id ?? null);
      setOriginalDateCreated(parsed.dateCreated ?? null);
      setTitle(parsed.title ?? '');
      setSelectedReminderType(parsed.reminderType ?? null);
      setReminderDate(parsed.reminderDate ? new Date(parsed.reminderDate) : null);
      setSelectedLocation(parsed.location ?? null);
      setShoppingItems(parsed.shoppingItems ?? []);
      setBudget(parsed.budget ?? '');
    } catch (e) {
      console.warn('Failed to parse list param', e);
    }
  }, [list]);

  const handleReminderTypePress = (typeId) => {
    setSelectedReminderType(typeId === selectedReminderType ? null : typeId);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setReminderDate(selectedDate);
    }
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    setShoppingItems([
      ...shoppingItems,
      { id: Date.now().toString(), name: newItemText.trim(), price: '0' },
    ]);
    setNewItemText('');
  };

  const handleDeleteItem = (id) => {
    setShoppingItems(shoppingItems.filter((item) => item.id !== id));
  };

  const handleItemPriceChange = (id, value) => {
    setShoppingItems(
      shoppingItems.map((item) => (item.id === id ? { ...item, price: value } : item))
    );
  };

  const totalCost = shoppingItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const remainingBudget = (parseFloat(budget) || 0) - totalCost;

  // Back just pops one screen — goes to wherever you actually came from,
  // not always straight to Home.
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/screens/home');
    }
  };

  // Save sends the note back to Home via the newList param (in-memory only
  // for now — no persistent storage until notesStore is wired back in).
  const handleSave = () => {
    if (!title.trim()) {
      handleBack();
      return;
    }

    const noteToSave = {
      id: noteId ?? Date.now().toString(),
      title: title.trim(),
      reminderType: selectedReminderType,
      reminderDate: reminderDate ? reminderDate.toISOString() : null,
      location: selectedLocation,
      shoppingItems,
      budget,
      totalCost,
      dateCreated: noteId ? originalDateCreated : new Date().toISOString(),
    };

    router.replace({
      pathname: '/screens/home',
      params: { newList: JSON.stringify(noteToSave) },
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color={colors.navy} />
        </Pressable>
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor={colors.placeholder}
          value={title}
          onChangeText={setTitle}
        />
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Reminder section */}
        <View style={styles.section}>
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setReminderExpanded(!reminderExpanded)}
          >
            <Text style={styles.sectionTitle}>Reminder</Text>
            <Feather
              name={reminderExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.navy}
            />
          </Pressable>

          {reminderExpanded && (
            <View style={styles.sectionBody}>
              <View style={styles.reminderRow}>
                {REMINDER_TYPES.map((type) => (
                  <Pressable
                    key={type.id}
                    style={[
                      styles.reminderChip,
                      selectedReminderType === type.id && styles.reminderChipSelected,
                    ]}
                    onPress={() => handleReminderTypePress(type.id)}
                  >
                    <Feather
                      name={type.icon}
                      size={16}
                      color={selectedReminderType === type.id ? colors.white : colors.navy}
                    />
                    <Text
                      style={[
                        styles.reminderChipText,
                        selectedReminderType === type.id && styles.reminderChipTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Feather name="calendar" size={16} color={colors.navy} />
                <Text style={styles.dateInputText}>
                  {reminderDate
                    ? reminderDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Add date'}
                </Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={reminderDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
          )}
        </View>

        {/* Location section */}
        <View style={styles.section}>
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setLocationExpanded(!locationExpanded)}
          >
            <Text style={styles.sectionTitle}>Location</Text>
            <Feather
              name={locationExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.navy}
            />
          </Pressable>

          {locationExpanded && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.locationScrollContent}
            >
              {LOCATIONS.map((loc) => (
                <View key={loc.id} style={styles.locationCard}>
                  <View style={styles.locationPreview} />
                  <View style={styles.locationRadioRow}>
                    <Pressable
                      style={styles.radioOuter}
                      onPress={() =>
                        setSelectedLocation(selectedLocation === loc.id ? null : loc.id)
                      }
                    >
                      {selectedLocation === loc.id && <View style={styles.radioInner} />}
                    </Pressable>
                    <Text style={styles.locationName} numberOfLines={1}>
                      {loc.name}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Shopping List section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shopping List</Text>

          <View style={styles.addItemRow}>
            <View style={styles.addItemInputWrapper}>
              <TextInput
                style={styles.addItemInput}
                placeholder="Add an item"
                placeholderTextColor={colors.placeholder}
                value={newItemText}
                onChangeText={setNewItemText}
                onSubmitEditing={handleAddItem}
              />
              <Pressable style={styles.addItemButton} onPress={handleAddItem}>
                <Text style={styles.addItemButtonText}>Add</Text>
              </Pressable>
            </View>
          </View>

          {shoppingItems.map((item) => (
            <View key={item.id} style={styles.shoppingItemRow}>
              <Text style={styles.shoppingItemText}>{item.name}</Text>
              <Pressable onPress={() => handleDeleteItem(item.id)}>
                <Feather name="trash-2" size={18} color={colors.error} />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Cost Estimation section */}
        <View style={styles.section}>
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setCostExpanded(!costExpanded)}
          >
            <Text style={styles.sectionTitle}>Cost Estimation</Text>
            <Feather
              name={costExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.navy}
            />
          </Pressable>

          {costExpanded && (
            <View style={styles.sectionBody}>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Budget</Text>
                <View style={styles.budgetInputWrapper}>
                  <Text style={styles.pesoSign}>₱</Text>
                  <TextInput
                    style={styles.budgetInput}
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                    value={budget}
                    onChangeText={setBudget}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {shoppingItems.map((item) => (
                <View key={item.id} style={styles.costItemRow}>
                  <Text style={styles.costItemName}>{item.name}</Text>
                  <View style={styles.costItemPriceWrapper}>
                    <Text style={styles.pesoSign}>₱</Text>
                    <TextInput
                      style={styles.costItemPriceInput}
                      value={item.price}
                      onChangeText={(value) => handleItemPriceChange(item.id, value)}
                      keyboardType="numeric"
                    />
                  </View>
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
                  style={[
                    styles.totalValue,
                    remainingBudget < 0 && styles.totalValueNegative,
                  ]}
                >
                  ₱{remainingBudget.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
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
  titleInput: {
    flex: 1,
    ...typography.heading,
    fontSize: 20,
    color: colors.navy,
    paddingVertical: spacing.sm / 2,
  },
  saveButton: {
    marginLeft: spacing.sm,
    backgroundColor: colors.gold,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm / 2,
    paddingHorizontal: spacing.md,
  },
  saveButtonText: {
    color: colors.navy,
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl ?? spacing.lg * 2,
  },
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
  sectionBody: {
    marginTop: spacing.sm,
  },
  reminderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reminderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm / 2,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  reminderChipSelected: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  reminderChipText: {
    fontSize: 13,
    color: colors.navy,
    marginLeft: spacing.sm / 2,
  },
  reminderChipTextSelected: {
    color: colors.white,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md - 4,
    marginTop: spacing.sm / 2,
  },
  dateInputText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm / 2,
  },
  locationScrollContent: {
    paddingTop: spacing.sm,
    paddingRight: spacing.md,
  },
  locationCard: {
    width: 110,
    marginRight: spacing.sm,
  },
  locationPreview: {
    width: 110,
    height: 70,
    borderRadius: borderRadius.sm ?? 4,
    backgroundColor: colors.border,
    marginBottom: spacing.sm / 2,
  },
  locationRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm / 2,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.navy,
  },
  locationName: {
    fontSize: 13,
    color: colors.text,
    flexShrink: 1,
  },
  addItemRow: {
    marginTop: spacing.sm,
  },
  addItemInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addItemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md - 4,
    fontSize: 14,
    color: colors.text,
  },
  addItemButton: {
    marginLeft: spacing.sm,
    backgroundColor: colors.gold,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  addItemButtonText: {
    color: colors.navy,
    fontWeight: '600',
    fontSize: 14,
  },
  shoppingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  shoppingItemText: {
    fontSize: 14,
    color: colors.text,
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
  budgetInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    width: 120,
  },
  pesoSign: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  budgetInput: {
    flex: 1,
    paddingVertical: spacing.sm / 2,
    fontSize: 14,
    color: colors.text,
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
  costItemPriceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    width: 100,
  },
  costItemPriceInput: {
    flex: 1,
    paddingVertical: spacing.sm / 2,
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