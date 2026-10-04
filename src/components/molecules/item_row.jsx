import Checkbox from '@/components/atoms/checkbox';
import { useAppTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/theme';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ItemRow({ name, subtitle, checked, showCheckbox, onToggle }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {showCheckbox && <Checkbox checked={checked} onToggle={onToggle} />}
      <View style={styles.textWrapper}>
        <Text style={[styles.text, checked && styles.textChecked]}>{name}</Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
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
    textWrapper: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    text: {
      fontSize: 14,
      color: colors.text,
    },
    textChecked: {
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
    },
    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });