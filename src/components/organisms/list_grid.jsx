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
  refreshing = false,
  onRefresh,
  onScroll,
  scrollEventThrottle = 16,
  ...rest
}) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={data && data.length > 0 ? styles.row : undefined}
      contentContainerStyle={[
        styles.list,
        { paddingBottom: bottomPadding, flexGrow: 1 },
        rest.contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{emptyText}</Text>
        </View>
      }
      {...rest}
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