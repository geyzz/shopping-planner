import CostEstimation from '@/components/organisms/cost_estimation';
import Header from '@/components/organisms/header';
import LocationSection from '@/components/organisms/location_section';
import ReminderSection from '@/components/organisms/reminder_section';
import ShoppingList from '@/components/organisms/shopping_list';
import { MALL_IMAGES } from '@/lib/mall_image';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

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
].map((m) => ({ ...m, image: MALL_IMAGES[m.id] }));

export default function ViewListPage() {
  const router = useRouter();
  const { list } = useLocalSearchParams();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [noteId, setNoteId] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedReminderType, setSelectedReminderType] = useState(null);
  const [reminderDate, setReminderDate] = useState(null);
  const [reminderTiming, setReminderTiming] = useState('on');
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
      setReminderTiming(details.reminderTiming ?? 'on');
      setSelectedLocation(details.location ?? null);
      setShoppingItems(
        (details.shoppingItems ?? []).map((item) => ({ checked: false, ...item }))
      );
      setBudget(details.budget ?? '');
    } catch (e) {
      console.warn('Failed to parse list param', e);
    }
  }, [list]);

  const totalCost = shoppingItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

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
      reminderTiming,
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
            reminderTiming,
            location: selectedLocation,
            shoppingItems,
            budget,
            totalCost,
          },
        }),
      },
    });
  };

  return (
    <>
      <Header
        title={title || 'Untitled'}
        onBack={handleBack}
        rightAction={
          <Pressable style={styles.editButton} onPress={handleEdit}>
            <Feather name="edit-2" size={16} color={colors.navy} />
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        }
      />

      <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
        <ReminderSection
          types={REMINDER_TYPES}
          type={selectedReminderType}
          date={reminderDate}
          timing={reminderTiming}
          readOnly
        />

        <LocationSection
          locations={LOCATIONS}
          value={selectedLocation}
          readOnly
        />

        <ShoppingList
          items={shoppingItems}
          onToggle={handleToggleItem}
          readOnly
        />

        <CostEstimation budget={budget} items={shoppingItems} editable={false} />
      </ScrollView>
    </>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl ?? spacing.lg * 2,
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: spacing.sm / 2,
      paddingHorizontal: spacing.sm,
    },
    editButtonText: {
      fontSize: 13,
      color: colors.navy,
      fontWeight: '600',
      marginLeft: 4,
    },
  });