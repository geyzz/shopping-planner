import { useAppTheme } from '@/theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export default function Checkbox({ checked, onToggle }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable style={styles.touchArea} onPress={onToggle}>
      <View style={checked ? styles.boxChecked : styles.boxUnchecked}>
        {checked && <Feather name="check" size={12} color={colors.white} />}
      </View>
    </Pressable>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    touchArea: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    boxUnchecked: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.navy,
    },
    boxChecked: {
      width: 20,
      height: 20,
      borderRadius: 4,
      backgroundColor: colors.navy,
      borderColor: colors.navy,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });