import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Modal, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/theme/theme';

export default function HomePage() {
  const router = useRouter();
  const { newList } = useLocalSearchParams();
  const [searchText, setSearchText] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [notes, setNotes] = useState([]);

  const name = 'Geyz';
  const numOfNotes = notes.length;

  // Whenever Create/Edit sends back a newList param, merge it into the list.
  // In-memory only for now — no persistent storage.
  useEffect(() => {
    if (!newList) return;

    try {
      const parsed = JSON.parse(newList);

      setNotes((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === parsed.id);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = parsed;
          return updated;
        }
        return [parsed, ...prev];
      });

      router.setParams({ newList: undefined });
    } catch (e) {
      console.warn('Failed to parse newList param', e);
    }
  }, [newList]);

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSort = () => {
    setShowOptionsMenu(false);
    console.log('Sort pressed');
  };

  const handleSelect = () => {
    setShowOptionsMenu(false);
    console.log('Select pressed');
  };

  const handleOpenNote = (note) => {
    router.push({
      pathname: '/screens/create_edit',
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

  const renderNote = ({ item }) => (
    <View style={styles.noteCard}>
      <View style={styles.notePreview}>
        <Feather name="file-text" size={22} color={colors.navy} />
      </View>
      <Text style={styles.noteTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.noteDate} numberOfLines={1}>
        {formatDate(item.dateCreated)}
      </Text>
      <Pressable style={styles.editButton} onPress={() => handleOpenNote(item)}>
        <Feather name="edit-2" size={14} color={colors.navy} />
        <Text style={styles.editButtonText}>Edit</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.logo}>Logo Name</Text>

      <View style={styles.greetingRow}>
        <Text style={styles.greetingText}>
          Hello {name}
          {'\n'}
          Your total notes are {numOfNotes}
        </Text>
      </View>

      <View style={styles.toolbarRow}>
        <View style={styles.searchWrapper}>
          <Feather name="search" size={18} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes"
            placeholderTextColor={colors.placeholder}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View>
          <Pressable
            style={styles.optionsButton}
            onPress={() => setShowOptionsMenu(true)}
          >
            <Feather name="more-vertical" size={22} color={colors.navy} />
          </Pressable>

          <Modal
            visible={showOptionsMenu}
            transparent
            animationType="fade"
            onRequestClose={() => setShowOptionsMenu(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowOptionsMenu(false)}
            >
              <View style={styles.optionsMenu}>
                <Pressable style={styles.optionsMenuItem} onPress={handleSort}>
                  <Feather name="sliders" size={16} color={colors.text} />
                  <Text style={styles.optionsMenuItemText}>Sort</Text>
                </Pressable>
                <View style={styles.optionsMenuDivider} />
                <Pressable style={styles.optionsMenuItem} onPress={handleSelect}>
                  <Feather name="check-square" size={16} color={colors.text} />
                  <Text style={styles.optionsMenuItemText}>Select</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        </View>
      </View>

      {filteredNotes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No notes yet</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderNote}
          numColumns={2}
          columnWrapperStyle={styles.notesRow}
          contentContainerStyle={styles.notesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        style={styles.addButton}
        onPress={() => router.push('/screens/create_edit')}
      >
        <Feather name="plus" size={26} color={colors.white} />
      </Pressable>

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

const styles = StyleSheet.create({
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
    minWidth: 140,
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
  },
  notePreview: {
    height: 70,
    borderRadius: borderRadius.sm ?? 4,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm / 2,
  },
  noteTitle: {
    ...typography.label,
    fontSize: 14,
    color: colors.navy,
    fontWeight: '700',
  },
  noteDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm / 2,
    marginTop: spacing.sm,
  },
  editButtonText: {
    fontSize: 12,
    color: colors.navy,
    fontWeight: '600',
    marginLeft: 4,
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