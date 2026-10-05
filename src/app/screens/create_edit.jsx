import CostEstimation from '@/components/organisms/cost_estimation';
import Header from '@/components/organisms/header';
import LocationSection from '@/components/organisms/location_section';
import ReminderSection from '@/components/organisms/reminder_section';
import ShoppingList from '@/components/organisms/shopping_list';
import { getItemPrices, getMallRecommendations } from '@/lib/mall_data';
import { MALL_IMAGES } from '@/lib/mall_image';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

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

export default function CreateEditPage() {
  const router = useRouter();
  const { list } = useLocalSearchParams();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [noteId, setNoteId] = useState(null);
  const [originalDateCreated, setOriginalDateCreated] = useState(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const [reminderExpanded, setReminderExpanded] = useState(false);
  const [selectedReminderType, setSelectedReminderType] = useState(null);
  const [reminderDate, setReminderDate] = useState(null);

  const [locationExpanded, setLocationExpanded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [shoppingItems, setShoppingItems] = useState([]);
  const [recommendations, setRecommendations] = useState({});

  const [costExpanded, setCostExpanded] = useState(false);
  const [budget, setBudget] = useState('');

  // Load an existing list when editing
  useEffect(() => {
    if (!list) return;
    try {
      const parsed = JSON.parse(list);
      setNoteId(parsed.id ?? null);
      setOriginalDateCreated(parsed.created_at ?? parsed.dateCreated ?? null);
      setTitle(parsed.title ?? '');

      const details = parsed.details ?? parsed;
      setSelectedReminderType(details.reminderType ?? null);
      setReminderDate(details.reminderDate ? new Date(details.reminderDate) : null);
      setSelectedLocation(details.location ?? null);
      setShoppingItems(details.shoppingItems ?? []);
      setBudget(details.budget ?? '');
    } catch (e) {
      console.warn('Failed to parse list param', e);
    }
  }, [list]);

  // Mall recommendations based on the shopping items
  const itemNamesKey = shoppingItems.map((i) => i.name).join('|');

  useEffect(() => {
    let cancelled = false;

    if (!shoppingItems.length) {
      setRecommendations({});
      return;
    }

    getMallRecommendations(shoppingItems.map((i) => i.name)).then((result) => {
      if (cancelled) return;
      const best = result[0]?.count ?? 0;
      const map = {};
      result.forEach((r) => {
        map[r.slug] = { ...r, best: best > 0 && r.count === best };
      });
      setRecommendations(map);
    });

    return () => {
      cancelled = true;
    };
  }, [itemNamesKey]);

  // Fill in estimated prices for items that don't have one yet: items typed without
  // picking a suggestion, and lists saved before prices existed. A price the user
  // already typed (anything above 0) is left alone.
  const unpricedKey = shoppingItems
    .filter((i) => i.estimatedPrice === undefined)
    .map((i) => i.name)
    .join('|');

  useEffect(() => {
    if (!unpricedKey) return;
    let cancelled = false;

    getItemPrices(unpricedKey.split('|')).then((prices) => {
      if (cancelled || !prices) return;
      setShoppingItems((prev) =>
        prev.map((item) => {
          if (item.estimatedPrice !== undefined) return item;
          const estimate = prices[item.name] ?? null;
          const untouched = !(parseFloat(item.price) > 0);
          return {
            ...item,
            estimatedPrice: estimate,
            price: estimate != null && untouched ? String(estimate) : item.price,
          };
        })
      );
    });

    return () => {
      cancelled = true;
    };
  }, [unpricedKey]);

  // `estimate` is the lowest known shop price. It becomes the starting price,
  // and the user can still type their own in Cost Estimation.
  const handleAddItem = (name, shops = [], estimate = null) => {
    setShoppingItems([
      ...shoppingItems,
      {
        id: Date.now().toString(),
        name,
        price: estimate != null ? String(estimate) : '0',
        estimatedPrice: estimate,
        shops,
      },
    ]);
  };

  const handleDeleteItem = (id) => {
    setShoppingItems(shoppingItems.filter((item) => item.id !== id));
  };

  const handleItemPriceChange = (id, value) => {
    setShoppingItems(
      shoppingItems.map((item) => (item.id === id ? { ...item, price: value } : item))
    );
  };

  // Put an edited price back to the estimate
  const handleResetItemPrice = (id) => {
    setShoppingItems(
      shoppingItems.map((item) =>
        item.id === id && item.estimatedPrice != null
          ? { ...item, price: String(item.estimatedPrice) }
          : item
      )
    );
  };

  const totalCost = shoppingItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/screens/home');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      handleBack();
      return;
    }

    setSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setSaving(false);
      Alert.alert('Not signed in', 'Please log in again before saving.');
      return;
    }

    const details = {
      reminderType: selectedReminderType,
      reminderDate: reminderDate ? reminderDate.toISOString() : null,
      location: selectedLocation,
      shoppingItems,
      budget,
      totalCost,
    };

    let error;

    if (noteId) {
      const { data: updated, error: updateError } = await supabase
        .from('lists')
        .update({ title: title.trim(), details })
        .eq('id', noteId)
        .select('id');

      error = updateError;
      if (!error && (!updated || updated.length === 0)) {
        error = { message: 'No row was updated. Check the update policy on the lists table.' };
      }
    } else {
      ({ error } = await supabase
        .from('lists')
        .insert({ title: title.trim(), details, user_id: session.user.id }));
    }

    setSaving(false);

    if (error) {
      console.log('Error saving list:', error.message);
      Alert.alert('Save failed', error.message);
      return;
    }

    router.replace('/screens/home');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <Header
        title={title}
        onBack={handleBack}
        editableTitle
        onTitleChange={setTitle}
        rightAction={
          <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
          </Pressable>
        }
      />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <ReminderSection
          types={REMINDER_TYPES}
          type={selectedReminderType}
          onTypeChange={setSelectedReminderType}
          date={reminderDate}
          onDateChange={setReminderDate}
          expanded={reminderExpanded}
          onToggle={() => setReminderExpanded(!reminderExpanded)}
        />

        <LocationSection
          locations={LOCATIONS}
          recommendations={recommendations}
          value={selectedLocation}
          onChange={setSelectedLocation}
          expanded={locationExpanded}
          onToggle={() => setLocationExpanded(!locationExpanded)}
        />

        <ShoppingList
          items={shoppingItems}
          onAdd={handleAddItem}
          onDelete={handleDeleteItem}
        />

        <CostEstimation
          budget={budget}
          items={shoppingItems}
          editable
          onChangeBudget={setBudget}
          onChangeItemPrice={handleItemPriceChange}
          onResetItemPrice={handleResetItemPrice}
          collapsible
          boxed={false}
          expanded={costExpanded}
          onToggle={() => setCostExpanded(!costExpanded)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl + 120,
    },
    saveButton: {
      marginLeft: spacing.sm,
      backgroundColor: colors.gold,
      borderRadius: 8,
      paddingVertical: spacing.sm / 2,
      paddingHorizontal: spacing.md,
    },
    saveButtonText: {
      color: colors.onGold,
      fontWeight: '700',
      fontSize: 14,
    },
  });