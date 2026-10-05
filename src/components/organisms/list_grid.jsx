import { useAppTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/theme';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function ListGrid({
  data,
  renderItem,
  keyExtractor,
  emptyText,
  bottomPadding = spacing.xl,
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (data.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    row: {
      justifyContent: 'space-between',
    },
    list: {
      paddingBottom: spacing.xl,
    },
    emptyState: {
      alignItems: 'center',
      marginTop: spacing.xl,
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });