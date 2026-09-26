import { supabase } from '@/lib/supabase'; // adjust this path to wherever your Supabase client file lives
import { borderRadius, colors, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function HomePage() {
  const router = useRouter();
  const { newList } = useLocalSearchParams();
  const [searchText, setSearchText] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [notes, setNotes] = useState([]);
  const [name, setName] = useState('');

  const numOfNotes = notes.length;

  // Fetch lists from Supabase whenever Home mounts (e.g. navigating back from another tab)
  useEffect(() => {
    const fetchLists = async () => {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error fetching lists:', error.message);
        return;
      }

      if (data) setNotes(data);
    };

    fetchLists();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.user_metadata?.first_name) {
        setName(session.user.user_metadata.first_name);
      }
    };

    const fetchLists = async () => {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Error fetching lists:', error.message);
        return;
      }
      if (data) setNotes(data);
    };

    fetchUser();
    fetchLists();
  }, []);

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

  const handleViewNote = (note) => {
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

  const renderNote = ({ item }) => (
    <Pressable style={styles.noteCard} onPress={() => handleViewNote(item)}>
      <View style={styles.viewRibbon}>
        <Text style={styles.viewRibbonText}>View</Text>
      </View>

      <View style={styles.notePreview}>
        <Feather name="image" size={32} color={colors.border} />
      </View>

      <Text style={styles.noteTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.noteDate} numberOfLines={1}>
        {formatDate(item.created_at)}
      </Text>

      <Pressable style={styles.editButton} onPress={() => handleOpenNote(item)}>
        <Text style={styles.editButtonText}>Edit List</Text>
      </Pressable>
    </Pressable>
  );

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

function ShapedNoteCard({ children, style, cardColor, borderColor, ribbonColor }) {
  const [size, setSize] = useState(null);

  const onLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    if (!size || size.width !== width || size.height !== height) {
      setSize({ width, height });
    }
  };

  // Angle of the diagonal cut, so the "View" text can rotate to match it
  const angle = size
    ? Math.atan2(size.height * 0.43, size.width * 0.39) * (180 / Math.PI)
    : 45;

  return (
    <View style={style} onLayout={onLayout}>
      {size && (
        <Svg
          width={size.width}
          height={size.height}
          style={StyleSheet.absoluteFillObject}
        >
          {/* Card body: clip-path: polygon(61% 0, 100% 43%, 100% 100%, 0 100%, 0 0) */}
          <Polygon
            points={`
              ${size.width * 0.61},0
              ${size.width},${size.height * 0.43}
              ${size.width},${size.height}
              0,${size.height}
              0,0
            `}
            fill={cardColor}
            stroke={borderColor}
            strokeWidth={1}
          />
          {/* Ribbon flap: clip-path: polygon(63% 0, 83% 0, 100% 11%, 100% 25%) */}
          <Polygon
            points={`
              ${size.width * 0.63},0
              ${size.width * 0.83},0
              ${size.width},${size.height * 0.11}
              ${size.width},${size.height * 0.25}
            `}
            fill={ribbonColor}
          />
        </Svg>
      )}

      {size && (
        <Text
          style={[
            styles.ribbonLabel,
            {
              top: size.height * 0.06,
              right: size.width * 0.02,
              transform: [{ rotate: `${angle}deg` }],
            },
          ]}
        >
          View
        </Text>
      )}

      {children}
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
    alignItems: 'center',
    overflow: 'hidden',
  },
  viewRibbon: {
    position: 'absolute',
    top: 10,
    right: -28,
    backgroundColor: colors.gold,
    paddingVertical: 3,
    width: 100,
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  viewRibbonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.navy,
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
    color: colors.navy,
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