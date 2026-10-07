import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function DateField({ value, editable, onChange, style }) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
  const [showPicker, setShowPicker] = useState(false);

  const formatted = value
    ? value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const handleChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const merged = new Date(selectedDate);
      if (value) {
        merged.setHours(value.getHours(), value.getMinutes(), 0, 0);
      } else {
        const now = new Date();
        const isToday =
          merged.getFullYear() === now.getFullYear() &&
          merged.getMonth() === now.getMonth() &&
          merged.getDate() === now.getDate();
        if (isToday) {
          merged.setHours(now.getHours() + 1, 0, 0, 0);
        } else {
          merged.setHours(9, 0, 0, 0);
        }
      }
      onChange(merged);
    }
  };

  if (!editable) {
    return (
      <View style={[styles.viewOnly, style]}>
        <Feather name="calendar" size={14} color={colors.navy} />
        <Text style={styles.viewOnlyText}>Date: {formatted}</Text>
      </View>
    );
  }

  return (
    <>
      <Pressable style={[styles.input, style]} onPress={() => setShowPicker(true)}>
        <Feather name="calendar" size={16} color={colors.navy} />
        <Text style={styles.inputText}>{formatted || 'Add Date'}</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          themeVariant={isDark ? 'dark' : 'light'}
          onChange={handleChange}
          minimumDate={new Date()}
        />
      )}
    </>
  );
}

const makeStyles = (colors, isDark) =>
  StyleSheet.create({
    input: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md - 4,
      marginTop: spacing.sm / 2,
      backgroundColor: isDark ? '#1F293D' : '#F7F8FA',
    },
    inputText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: spacing.sm / 2,
    },
    viewOnly: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewOnlyText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: spacing.sm / 2,
    },
  });