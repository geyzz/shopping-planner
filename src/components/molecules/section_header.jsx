import { useAppTheme } from '@/theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function SectionHeader({ title, collapsible, expanded, onToggle }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!collapsible) {
    return <Text style={styles.title}>{title}</Text>;
  }

  return (
    <Pressable style={styles.header} onPress={onToggle}>
      <Text style={styles.title}>{title}</Text>
      <Feather
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={colors.navy}
      />
    </Pressable>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 16,
      color: colors.navy,
      fontWeight: '700',
    },
  });