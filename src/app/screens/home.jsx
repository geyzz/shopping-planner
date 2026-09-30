import { supabase } from '@/lib/supabase'; // adjust this path to wherever your Supabase client file lives
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const SORT_FIELDS = [
  { key: 'created_at', label: 'Date created' },
  { key: 'last_opened_at', label: 'Last opened' },
];

const SORT_DIRECTIONS = [
  { key: 'desc', label: 'Descending', icon: 'arrow-down' },
  { key: 'asc', label: 'Ascending', icon: 'arrow-up' },
];

// Collect every text value from any JSON / array / object
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

// Searchable text: items from list_items + anything inside the details column
const getItemTexts = (note) => collectStrings(note.details);

export default function HomePage() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [notes, setNotes] = useState([]);
  const [name, setName] = useState('');

  // Sort state
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Select state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const numOfNotes = notes.length;

  // Fetch user + lists + items every time Home gains focus
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.user_metadata?.first_name) {
          setName(session.user.user_metadata.first_name);
        }

        const { data, error } = await supabase.from('lists').select('*');
        if (error) {
          console.log('Error fetching lists:', error.message);
          return;
        }

        setNotes(data ?? []);
      };

      load();
    }, [])
  );

  const visibleNotes = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    // Search matches the list title OR any item inside the list
    const filtered = !query
      ? notes
      : notes.filter(
          (note) =>
            (note.title ?? '').toLowerCase().includes(query) ||
            getItemTexts(note).some((text) => text.toLowerCase().includes(query))
        );

    // Never-opened lists fall back to their created date
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

  // ---------- Select helpers ----------
  const enterSelectMode = () => {
    setShowOptionsMenu(false);
    setSelectedIds([]);
    setSelectMode(true);
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allVisibleSelected =
    visibleNotes.length > 0 && visibleNotes.every((n) => selectedIds.includes(n.id));

  const toggleSelectAll = () => {
    setSelectedIds(allVisibleSelected ? [] : visibleNotes.map((n) => n.id));
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

  // ---------- Sort helpers ----------
  const openSortMenu = () => {
    setShowOptionsMenu(false);
    setShowSortMenu(true);
  };

  // ---------- Navigation ----------
  // Record "last opened" (optimistically in state, then in Supabase)
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

  const goToTab = (pathname) => {
    router.replace(pathname);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderNote = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);

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
          <Feather name="image" size={32} color={colors.border} />
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
      <Text style={styles.logo}>Plan_.ed</Text>

      <View style={styles.greetingRow}>
        <Text style={styles.greetingText}>
          Hello {name}
          {'\n'}
          Your total notes are {numOfNotes}
        </Text>
      </View>

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
            <Feather name="trash-2" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : (
        <View style={styles.toolbarRow}>
          <View style={styles.searchWrapper}>
            <Feather name="search" size={18} color={colors.placeholder} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search title or items"
              placeholderTextColor={colors.placeholder}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <Pressable style={styles.optionsButton} onPress={() => setShowOptionsMenu(true)}>
            <Feather name="more-vertical" size={22} color={colors.navy} />
          </Pressable>
        </View>
      )}

      {/* Options menu (Sort / Select) */}
      <Modal
        visible={showOptionsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowOptionsMenu(false)}>
          <View style={styles.optionsMenu}>
            <Pressable style={styles.optionsMenuItem} onPress={openSortMenu}>
              <Feather name="sliders" size={16} color={colors.text} />
              <Text style={styles.optionsMenuItemText}>Sort</Text>
            </Pressable>
            <View style={styles.optionsMenuDivider} />
            <Pressable style={styles.optionsMenuItem} onPress={enterSelectMode}>
              <Feather name="check-square" size={16} color={colors.text} />
              <Text style={styles.optionsMenuItemText}>Select</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Sort menu */}
      <Modal
        visible={showSortMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortMenu(false)}>
          <Pressable style={styles.optionsMenu} onPress={() => {}}>
            <Text style={styles.sortSectionLabel}>Sort by</Text>
            {SORT_FIELDS.map((field) => (
              <Pressable
                key={field.key}
                style={styles.optionsMenuItem}
                onPress={() => setSortField(field.key)}
              >
                <Feather
                  name={sortField === field.key ? 'check' : 'circle'}
                  size={16}
                  color={sortField === field.key ? colors.navy : colors.border}
                />
                <Text style={styles.optionsMenuItemText}>{field.label}</Text>
              </Pressable>
            ))}

            <View style={styles.optionsMenuDivider} />

            <Text style={styles.sortSectionLabel}>Order</Text>
            {SORT_DIRECTIONS.map((dir) => (
              <Pressable
                key={dir.key}
                style={styles.optionsMenuItem}
                onPress={() => setSortDirection(dir.key)}
              >
                <Feather
                  name={dir.icon}
                  size={16}
                  color={sortDirection === dir.key ? colors.navy : colors.border}
                />
                <Text
                  style={[
                    styles.optionsMenuItemText,
                    sortDirection === dir.key && styles.sortActiveText,
                  ]}
                >
                  {dir.label}
                </Text>
              </Pressable>
            ))}

            <View style={styles.optionsMenuDivider} />
            <Pressable style={styles.optionsMenuItem} onPress={() => setShowSortMenu(false)}>
              <Text style={[styles.optionsMenuItemText, styles.sortDoneText]}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {visibleNotes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {searchText.trim() ? 'No matching notes' : 'No notes yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleNotes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderNote}
          extraData={{ selectMode, selectedIds, colors }}
          numColumns={2}
          columnWrapperStyle={styles.notesRow}
          contentContainerStyle={styles.notesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!selectMode && (
        <Pressable style={styles.addButton} onPress={() => router.push('/screens/create_edit')}>
          <Feather name="plus" size={26} color="#FFFFFF" />
        </Pressable>
      )}

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => goToTab('/screens/home')}>
          <Feather name="home" size={24} color={colors.navy} />
          <Text style={styles.navLabel}>Home</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => goToTab('/screens/settings')}>
          <Feather name="user" size={24} color={colors.textSecondary} />
          <Text style={styles.navLabel}>Profile</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => goToTab('/screens/calendar')}>
          <Feather name="calendar" size={24} color={colors.textSecondary} />
          <Text style={styles.navLabel}>Calendar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
    },
    logo: {
      ...typography.heading,
      color: colors.navy,
    },
    greetingRow: {
      alignItems: 'flex-start',
      marginTop: spacing.md,
    },
    greetingText: {
      ...typography.label,
      color: colors.text,
    },
    toolbarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: spacing.lg,
    },
    optionsButton: {
      marginLeft: spacing.sm,
      marginRight: spacing.sm,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
    optionsMenu: {
      position: 'absolute',
      top: 110,
      right: spacing.md + spacing.sm,
      backgroundColor: colors.white,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.sm / 2,
      minWidth: 170,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    optionsMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    optionsMenuItemText: {
      ...typography.label,
      fontSize: 14,
      color: colors.text,
      marginLeft: spacing.sm,
    },
    optionsMenuDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: spacing.sm,
    },
    sortSectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      paddingHorizontal: spacing.sm,
      paddingTop: spacing.sm,
    },
    sortActiveText: {
      color: colors.navy,
      fontWeight: '700',
    },
    sortDoneText: {
      color: colors.navy,
      fontWeight: '700',
      marginLeft: 0,
    },
    searchWrapper: {
      width: '60%',
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.sm,
    },
    searchIcon: {
      marginRight: spacing.sm / 2,
    },
    searchInput: {
      flex: 1,
      paddingVertical: spacing.md - 6,
      fontSize: 14,
      color: colors.text,
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
      backgroundColor: '#D64545',
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteButtonDisabled: {
      opacity: 0.4,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyStateText: {
      ...typography.label,
      color: colors.textSecondary,
    },
    notesList: {
      paddingTop: spacing.md,
      paddingBottom: 160,
    },
    notesRow: {
      justifyContent: 'space-between',
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
      color: '#0B1B3F',
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
      marginBottom: spacing.sm,
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
      color: '#0B1B3F',
      fontWeight: '700',
    },
    addButton: {
      position: 'absolute',
      right: spacing.md,
      bottom: 90,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.navy,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottomNav: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.white,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: spacing.sm,
      paddingBottom: spacing.md,
    },
    navItem: {
      alignItems: 'center',
    },
    navLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });