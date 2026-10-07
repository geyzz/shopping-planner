import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function SetTime({ value, editable, onChange, style }) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
  const [showPicker, setShowPicker] = useState(false);

  const formatted = value
    ? value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null;

  const handleChange = (event, selectedTime) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedTime) {
      const merged = new Date(value || new Date());
      merged.setHours(selectedTime.getHours());
      merged.setMinutes(selectedTime.getMinutes());
      onChange(merged);
    }
  };

  if (!editable) {
    return (
      <View style={[styles.viewOnly, style]}>
        <Feather name="clock" size={14} color={colors.navy} />
        <Text style={styles.viewOnlyText}>Time: {formatted}</Text>
      </View>
    );
  }

  return (
    <>
      <Pressable style={[styles.input, style]} onPress={() => setShowPicker(true)}>
        <Feather name="clock" size={16} color={colors.navy} />
        <Text style={styles.inputText}>{formatted || 'Add Time'}</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          themeVariant={isDark ? 'dark' : 'light'}
          onChange={handleChange}
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