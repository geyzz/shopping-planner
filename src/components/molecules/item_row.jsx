import Checkbox from '@/components/atoms/checkbox';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/theme';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ItemRow({ name, checked, showCheckbox, onToggle }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {showCheckbox && <Checkbox checked={checked} onToggle={onToggle} />}
      <Text style={[styles.text, checked && styles.textChecked]}>{name}</Text>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    text: {
      fontSize: 14,
      color: colors.text,
      marginLeft: spacing.sm,
    },
    textChecked: {
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
    },
  });