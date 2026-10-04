import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing, typography } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

// Small popover menu anchored to the top right, used for the Options and Sort
// menus on Home.
//
// sections: [{ title?, items: [{ key, label, icon?, onPress, active? }] }]
//   active undefined: normal item
//   active true:      highlighted (navy, bold)
//   active false:     icon is dimmed, so a row can show a selected state
// top: distance from the top of the screen
export default function MenuDropdown({ visible, onClose, sections = [], top = 110 }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const iconColor = (active) =>
    active === true ? colors.navy : active === false ? colors.border : colors.text;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.menu, { top }]} onPress={() => {}}>
          {sections.map((section, index) => (
            <View key={section.title ?? index}>
              {index > 0 && <View style={styles.divider} />}
              {section.title ? <Text style={styles.sectionLabel}>{section.title}</Text> : null}
              {section.items.map((item) => (
                <Pressable key={item.key} style={styles.item} onPress={item.onPress}>
                  {item.icon ? (
                    <Feather name={item.icon} size={16} color={iconColor(item.active)} />
                  ) : null}
                  <Text
                    style={[
                      styles.itemText,
                      !item.icon && styles.itemTextNoIcon,
                      item.active === true && styles.itemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
    menu: {
      position: 'absolute',
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
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    itemText: {
      ...typography.label,
      color: colors.text,
      marginLeft: spacing.sm,
    },
    itemTextNoIcon: {
      marginLeft: 0,
    },
    itemTextActive: {
      color: colors.navy,
      fontWeight: '700',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: spacing.sm,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      paddingHorizontal: spacing.sm,
      paddingTop: spacing.sm,
    },
  });