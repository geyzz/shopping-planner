import { formatCurrency } from '@/lib/format';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing } from '@/theme/theme';
import { useMemo } from 'react';
import { TextInput as RNTextInput, StyleSheet, Text, View } from 'react-native';

export default function CostRow({ name, price, editable, onChangePrice }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <Text style={styles.name}>{name}</Text>

      {editable ? (
        <View style={styles.priceWrapper}>
          <Text style={styles.pesoSign}>₱</Text>
          <RNTextInput
            style={styles.priceInput}
            value={price}
            onChangeText={onChangePrice}
            keyboardType="numeric"
            placeholderTextColor={colors.placeholder}
          />
        </View>
      ) : (
        <Text style={styles.price}>{formatCurrency(price)}</Text>
      )}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm / 2,
    },
    name: { fontSize: 14, color: colors.text, flex: 1 },
    price: { fontSize: 14, color: colors.text },
    priceWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.sm,
      width: 100,
    },
    pesoSign: { fontSize: 14, color: colors.textSecondary, marginRight: 4 },
    priceInput: {
      flex: 1,
      paddingVertical: spacing.sm / 2,
      fontSize: 14,
      color: colors.text,
    },
  });