import AppLogo from '@/components/atoms/app_logo';
import SearchBar from '@/components/molecules/search_bar';
import BottomNavigation from '@/components/organisms/bottom_nav';
import GreetingBanner from '@/components/organisms/greeting_banner';
import ListGrid from '@/components/organisms/list_grid';
import MenuDropdown from '@/components/organisms/menu_dropdown';
import { cancelReminderNotification } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SORT_FIELDS = [
  { key: 'created_at', label: 'Date created' },
  { key: 'last_opened_at', label: 'Last opened' },
];

const SORT_DIRECTIONS = [
  { key: 'desc', label: 'Descending', icon: 'arrow-down' },
  { key: 'asc', label: 'Ascending', icon: 'arrow-up' },
];

const collectStrings = (value, out = []) => {
  if (value == null) return out;
  if (typeof value === 'string') {
    const t = value.trim();
    if (t.startsWith('[') || t.startsWith('{')) {
      try {
        collectStrings(JSON.parse(t), out);
        return out;
      } catch {}
    }
    if (t) out.push(t);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectStrings(v, out));
  } else if (typeof value === 'object') {
    Object.values(value).forEach((v) => collectStrings(v, out));
  }
  return out;
};

const getItemTexts = (note) => collectStrings(note.details);

export default function HomePage() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const [searchText, setSearchText] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [notes, setNotes] = useState([]);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const optionsButtonRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 110, right: 24 });

  const numOfNotes = notes.length;

  const openOptionsMenu = () => {
    optionsButtonRef.current?.measureInWindow((x, y, w, h) => {
      setMenuPos({ top: y + h + 4, right: screenWidth - (x + w) });
      setShowOptionsMenu(true);
    });
  };

  const loadData = useCallback(async () => {
    try {
      const [
        cachedAvatar,
        savedSortField,
        savedSortDir,
        savedSelectMode,
        savedSelectedIds,
      ] = await Promise.all([
        AsyncStorage.getItem('user_avatar_uri').catch(() => null),
        AsyncStorage.getItem('home_sort_field').catch(() => null),
        AsyncStorage.getItem('home_sort_direction').catch(() => null),
        AsyncStorage.getItem('home_select_mode').catch(() => null),
        AsyncStorage.getItem('home_selected_ids').catch(() => null),
      ]);

      if (cachedAvatar) setAvatarUrl(cachedAvatar);

      if (savedSortField && (savedSortField === 'created_at' || savedSortField === 'last_opened_at')) {
        setSortField(savedSortField);
      }
      if (savedSortDir && (savedSortDir === 'desc' || savedSortDir === 'asc')) {
        setSortDirection(savedSortDir);
      }
      if (savedSelectMode === 'true') {
        setSelectMode(true);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.user_metadata) {
        const meta = session.user.user_metadata;
        if (meta.first_name) setName(meta.first_name);
        if (meta.avatar_url) setAvatarUrl(meta.avatar_url);
      }

      const { data, error } = await supabase.from('lists').select('*');
      if (error) {
        console.log('Error fetching lists:', error.message);
        return;
      }

      const fetchedLists = data ?? [];
      setNotes(fetchedLists);

      if (savedSelectedIds) {
        try {
          const parsed = JSON.parse(savedSelectedIds);
          if (Array.isArray(parsed)) {
            const validIds = new Set(fetchedLists.map((n) => n.id));
            const filtered = parsed.filter((id) => validIds.has(id));
            setSelectedIds(filtered);
            if (filtered.length !== parsed.length) {
              AsyncStorage.setItem('home_selected_ids', JSON.stringify(filtered)).catch(() => {});
            }
          }
        } catch {}
      }
    } catch (err) {
      console.log('Error loading home data:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSetSortField = (fieldKey) => {
    setSortField(fieldKey);
    AsyncStorage.setItem('home_sort_field', fieldKey).catch(() => {});
  };

  const handleSetSortDirection = (dirKey) => {
    setSortDirection(dirKey);
    AsyncStorage.setItem('home_sort_direction', dirKey).catch(() => {});
  };

  const visibleNotes = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    const filtered = !query
      ? notes
      : notes.filter(
          (note) =>
            (note.title ?? '').toLowerCase().includes(query) ||
            getItemTexts(note).some((text) => text.toLowerCase().includes(query))
        );

    const getTime = (note) => {
      const value =
        sortField === 'last_opened_at'
          ? note.last_opened_at ?? note.created_at
          : note.created_at;
      return value ? new Date(value).getTime() : 0;
    };

    return [...filtered].sort((a, b) =>
      sortDirection === 'asc' ? getTime(a) - getTime(b) : getTime(b) - getTime(a)
    );
  }, [notes, searchText, sortField, sortDirection]);

  const enterSelectMode = () => {
    setShowOptionsMenu(false);
    setSelectedIds([]);
    setSelectMode(true);
    AsyncStorage.setItem('home_select_mode', 'true').catch(() => {});
    AsyncStorage.setItem('home_selected_ids', JSON.stringify([])).catch(() => {});
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds([]);
    AsyncStorage.removeItem('home_select_mode').catch(() => {});
    AsyncStorage.removeItem('home_selected_ids').catch(() => {});
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      AsyncStorage.setItem('home_selected_ids', JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const allVisibleSelected =
    visibleNotes.length > 0 && visibleNotes.every((n) => selectedIds.includes(n.id));

  const toggleSelectAll = () => {
    const next = allVisibleSelected ? [] : visibleNotes.map((n) => n.id);
    setSelectedIds(next);
    AsyncStorage.setItem('home_selected_ids', JSON.stringify(next)).catch(() => {});
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) return;

    const count = selectedIds.length;
    Alert.alert(
      'Delete lists',
      `Delete ${count} ${count === 1 ? 'list' : 'lists'}? This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const listsToDelete = notes.filter((n) => selectedIds.includes(n.id));
            listsToDelete.forEach((l) => {
              const details = l.details ?? {};
              if (details.notificationId) {
                cancelReminderNotification(details.notificationId);
              }
            });

            const { error } = await supabase.from('lists').delete().in('id', selectedIds);

            if (error) {
              console.log('Error deleting lists:', error.message);
              Alert.alert('Error', 'Could not delete the selected lists. Please try again.');
              return;
            }

            setNotes((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
            exitSelectMode();
          },
        },
      ]
    );
  };

  const openSortMenu = () => {
    setShowOptionsMenu(false);
    setShowSortMenu(true);
  };

  const markOpened = async (note) => {
    const now = new Date().toISOString();
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, last_opened_at: now } : n)));

    const { error } = await supabase
      .from('lists')
      .update({ last_opened_at: now })
      .eq('id', note.id);

    if (error) console.log('Error updating last_opened_at:', error.message);
  };

  const handleOpenNote = (note) => {
    markOpened(note);
    router.push({
      pathname: '/screens/create_edit',
      params: { list: JSON.stringify(note) },
    });
  };

  const handleViewNote = (note) => {
    markOpened(note);
    router.push({
      pathname: '/screens/view_list',
      params: { list: JSON.stringify(note) },
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderNote = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    const shoppingItems = item.details?.shoppingItems ?? [];

    return (
      <Pressable
        style={[styles.noteCard, selectMode && isSelected && styles.noteCardSelected]}
        onPress={() => (selectMode ? toggleSelected(item.id) : handleViewNote(item))}
      >
        {selectMode ? (
          <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
            {isSelected && <Feather name="check" size={14} color={colors.white} />}
          </View>
        ) : (
          <View style={styles.viewRibbon}>
            <Text style={styles.viewRibbonText}>View</Text>
          </View>
        )}

        <View style={styles.notePreview}>
          {shoppingItems.length === 0 ? (
            <Feather name="file-text" size={32} color={colors.border} />
          ) : (
            <View style={styles.previewList}>
              {shoppingItems.slice(0, 4).map((shopItem) => (
                <Text
                  key={shopItem.id}
                  style={[styles.previewItem, shopItem.checked && styles.previewItemDone]}
                  numberOfLines={1}
                >
                  • {shopItem.name}
                </Text>
              ))}
              {shoppingItems.length > 4 && (
                <Text style={styles.previewMore}>+{shoppingItems.length - 4} more</Text>
              )}
            </View>
          )}
        </View>

        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.noteDate} numberOfLines={1}>
          {formatDate(item.created_at)}
        </Text>

        {!selectMode && (
          <Pressable style={styles.editButton} onPress={() => handleOpenNote(item)}>
            <Text style={styles.editButtonText}>Edit List</Text>
          </Pressable>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.headerRow, { marginTop: insets.top + spacing.sm }]}>
        <View style={styles.logoCard}>
          <AppLogo />
        </View>
        <Pressable
          style={styles.notifButton}
          onPress={() => router.push('/screens/notif')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Feather name="bell" size={20} color={colors.navy} />
        </Pressable>
      </View>

      <GreetingBanner name={name} totalCount={numOfNotes} />

      {selectMode ? (
        <View style={styles.selectBar}>
          <Pressable onPress={exitSelectMode} hitSlop={8}>
            <Text style={styles.selectBarAction}>Cancel</Text>
          </Pressable>

          <Text style={styles.selectBarCount}>{selectedIds.length} selected</Text>

          <Pressable onPress={toggleSelectAll} hitSlop={8}>
            <Text style={styles.selectBarAction}>{allVisibleSelected ? 'None' : 'All'}</Text>
          </Pressable>

          <Pressable
            onPress={deleteSelected}
            disabled={selectedIds.length === 0}
            hitSlop={8}
            style={[styles.deleteButton, selectedIds.length === 0 && styles.deleteButtonDisabled]}
          >
            <Feather name="trash-2" size={18} color={colors.white} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.toolbarRow}>
          <View style={styles.searchWrapper}>
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search"
              compact
            />
          </View>

          <Pressable
            ref={optionsButtonRef}
            style={styles.optionsButton}
            onPress={openOptionsMenu}
          >
            <Feather name="more-vertical" size={22} color={colors.navy} />
          </Pressable>
        </View>
      )}

      <MenuDropdown
        visible={showOptionsMenu}
        onClose={() => setShowOptionsMenu(false)}
        top={menuPos.top}
        right={menuPos.right}
        sections={[
          {
            items: [
              { key: 'sort', label: 'Sort', icon: 'sliders', onPress: openSortMenu },
              { key: 'select', label: 'Select', icon: 'check-square', onPress: enterSelectMode },
            ],
          },
        ]}
      />

      <MenuDropdown
        visible={showSortMenu}
        onClose={() => setShowSortMenu(false)}
        top={menuPos.top}
        right={menuPos.right}
        sections={[
          {
            title: 'Sort by',
            items: SORT_FIELDS.map((field) => ({
              key: field.key,
              label: field.label,
              icon: sortField === field.key ? 'check' : 'circle',
              active: sortField === field.key,
              onPress: () => handleSetSortField(field.key),
            })),
          },
          {
            title: 'Order',
            items: SORT_DIRECTIONS.map((dir) => ({
              key: dir.key,
              label: dir.label,
              icon: dir.icon,
              active: sortDirection === dir.key,
              onPress: () => handleSetSortDirection(dir.key),
            })),
          },
          {
            items: [{ key: 'done', label: 'Done', onPress: () => setShowSortMenu(false) }],
          },
        ]}
      />

      <ListGrid
        data={visibleNotes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderNote}
        emptyText={searchText.trim() ? 'No matching notes' : 'No notes yet'}
        bottomPadding={Math.max(insets.bottom, spacing.sm) + 150}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {!selectMode && (
        <Pressable
          style={[styles.addButton, { bottom: Math.max(insets.bottom, spacing.sm) + spacing.sm + 82 }]}
          onPress={() => router.push('/screens/create_edit')}
        >
          <Feather name="file-plus" size={24} color={colors.white} />
        </Pressable>
      )}

      <BottomNavigation
        activeTab="home"
        onTabPress={(path) => router.replace(path)}
        avatarUrl={avatarUrl}
      />
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.md + 14,
      height: 48,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.full,
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    notifButton: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    toolbarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    searchWrapper: {
      width: '50%',
      minWidth: 0,
    },
    optionsButton: {
      marginLeft: spacing.sm,
    },
    selectBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.lg,
      paddingVertical: spacing.sm,
    },
    selectBarAction: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.navy,
    },
    selectBarCount: {
      fontSize: 14,
      color: colors.text,
    },
    deleteButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteButtonDisabled: {
      opacity: 0.4,
    },
    noteCard: {
      width: '48%',
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      marginBottom: spacing.sm,
      alignItems: 'center',
      overflow: 'hidden',
    },
    noteCardSelected: {
      borderColor: colors.navy,
      borderWidth: 2,
    },
    checkbox: {
      position: 'absolute',
      top: 8,
      left: 8,
      zIndex: 2,
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.navy,
      backgroundColor: colors.white,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.navy,
    },
    viewRibbon: {
      position: 'absolute',
      top: 10,
      right: -28,
      zIndex: 1,
      backgroundColor: colors.gold,
      paddingVertical: 3,
      width: 100,
      alignItems: 'center',
      transform: [{ rotate: '45deg' }],
    },
    viewRibbonText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.onGold,
    },
    notePreview: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: borderRadius.sm ?? 4,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.sm,
      marginBottom: spacing.sm,
    },
    previewList: {
      alignSelf: 'stretch',
    },
    previewItem: {
      fontSize: 12,
      color: colors.text,
      marginBottom: 3,
    },
    previewItemDone: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    previewMore: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    noteTitle: {
      ...typography.label,
      fontSize: 15,
      color: colors.navy,
      fontWeight: '700',
      textAlign: 'center',
    },
    noteDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    editButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.gold,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm / 2,
      paddingHorizontal: spacing.md,
      width: '100%',
    },
    editButtonText: {
      fontSize: 13,
      color: colors.onGold,
      fontWeight: '700',
    },
    addButton: {
      position: 'absolute',
      right: spacing.md,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.navy,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
  });