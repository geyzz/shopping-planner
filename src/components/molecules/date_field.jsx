import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function DateField({ value, editable, onChange }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [showPicker, setShowPicker] = useState(false);

  const formatted = value
    ? value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const handleChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  if (!editable) {
    return (
      <View style={styles.viewOnly}>
        <Feather name="calendar" size={14} color={colors.navy} />
        <Text style={styles.viewOnlyText}>Date: {formatted}</Text>
      </View>
    );
  }

  return (
    <>
      <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
        <Feather name="calendar" size={16} color={colors.navy} />
        <Text style={styles.inputText}>{formatted || 'Add Date'}</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
          minimumDate={new Date()}
        />
      )}
    </>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    input: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md - 4,
      marginTop: spacing.sm / 2,
    },
    inputText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: spacing.sm / 2,
    },
    viewOnly: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: spacing.md,
    },
    viewOnlyText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: spacing.sm / 2,
    },
  });