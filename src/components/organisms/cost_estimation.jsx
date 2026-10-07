import CostRow from '@/components/molecules/cost_row';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing } from '@/theme/theme';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function CostEstimation({
  budget,
  items = [],
  editable = false,
  onChangeBudget,
  onChangeItemPrice,
  collapsible = false,
  expanded = true,
  onToggle,
  boxed = true,
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const total = items.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0);
  const budgetNum = parseFloat(budget) || 0;
  const remaining = budgetNum - total;
  const showBody = !collapsible || expanded;

  return (
    <View style={[styles.container, boxed && styles.card]}>
      <Pressable
        style={styles.header}
        onPress={collapsible ? onToggle : undefined}
        disabled={!collapsible}
      >
        <Text style={styles.title}>Cost Estimation</Text>
        {collapsible && (
          <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.text} />
        )}
      </Pressable>

      {showBody && (
        <View>
          <View style={styles.budgetRow}>
            <Text style={styles.label}>Budget</Text>
            {editable ? (
              <View style={styles.inputWrapper}>
                <Text style={styles.peso}>₱</Text>
                <TextInput
                  style={styles.input}
                  value={String(budget ?? '')}
                  onChangeText={onChangeBudget}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            ) : (
              <Text style={styles.value}>₱{budgetNum.toFixed(2)}</Text>
            )}
          </View>

          {items.map((item) => (
            <CostRow
              key={item.id}
              name={item.name}
              price={item.price}
              editable={editable}
              onChangePrice={(v) => onChangeItemPrice?.(item.id, v)}
            />
          ))}

          <View style={styles.divider} />
          <View style={styles.budgetRow}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>₱{total.toFixed(2)}</Text>
          </View>
          {budgetNum > 0 && (
            <View style={styles.budgetRow}>
              <Text style={styles.label}>{remaining >= 0 ? 'Remaining' : 'Over budget'}</Text>
              <Text style={[styles.value, remaining < 0 && { color: colors.error ?? 'red' }]}>
                ₱{Math.abs(remaining).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      marginTop: spacing.md,
    },
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      backgroundColor: colors.white,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 16, fontWeight: '700', color: colors.text },
    budgetRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.sm / 2,
    },
    label: { fontSize: 14, color: colors.textSecondary },
    value: { fontSize: 14, fontWeight: '600', color: colors.text },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.sm,
      width: 100,
    },
    peso: { fontSize: 14, color: colors.textSecondary, marginRight: 4 },
    input: { flex: 1, paddingVertical: spacing.sm / 2, fontSize: 14, color: colors.text },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  });