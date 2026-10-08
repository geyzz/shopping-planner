import { useAppTheme } from '@/theme/ThemeContext';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

export default function RadioButton({ selected = false, size = 20, style }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.outer, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {selected ? (
        <View
          style={[styles.inner, { width: size / 2, height: size / 2, borderRadius: size / 4 }]}
        />
      ) : null}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    outer: {
      borderWidth: 2,
      borderColor: colors.navy,
      justifyContent: 'center',
      alignItems: 'center',
    },
    inner: { backgroundColor: colors.navy },
  });