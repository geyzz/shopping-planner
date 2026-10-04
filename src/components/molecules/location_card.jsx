import RadioButton from '@/components/atoms/radio_button';
import { useAppTheme } from '@/theme/ThemeContext';
import { borderRadius, spacing } from '@/theme/theme';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';


export default function LocationCard({ image, address, selected, onSelect, size, recommended, badge }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors, size), [colors, size]);
  const selectable = size === 'small';

  return (
    <Pressable
      style={styles.card}
      onPress={selectable ? onSelect : undefined}
      disabled={!selectable}
      accessibilityRole={selectable ? 'radio' : undefined}
      accessibilityState={{ selected: !!selected }}
    >
      {image ? (
        <Image
          source={typeof image === 'string' ? { uri: image } : image}
          style={styles.preview}
        />
      ) : (
        <View style={styles.preview} />
      )}

      <View style={styles.row}>
        {selectable && <RadioButton selected={selected} size={18} />}
        <Text style={styles.address} numberOfLines={1}>
          {address}
        </Text>
      </View>
      {badge ? (
        <Text
          numberOfLines={1}
          style={[styles.badge, recommended && styles.badgeBest]}
        >
          {recommended ? `★ Best · ${badge}` : badge}
        </Text>
      ) : null}
    </Pressable>
  );
}

const makeStyles = (colors, size) =>
  StyleSheet.create({
    badge: {
      fontSize: 11,
      color: colors.text,
      opacity: 0.7,
      marginTop: 2,
    },
    badgeBest: {
      color: colors.gold,
      fontWeight: '700',
      opacity: 1,
    },
    card: {
      width: size === 'small' ? 110 : '100%',
      marginRight: size === 'small' ? spacing.sm : 0,
    },
    preview: {
      width: '100%',
      height: size === 'small' ? 70 : 140,
      borderRadius: borderRadius.sm ?? 4,
      backgroundColor: colors.border,
      marginBottom: spacing.sm / 2,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    address: {
      fontSize: size === 'small' ? 13 : 15,
      color: colors.text,
      fontWeight: size === 'small' ? '400' : '600',
      marginLeft: size === 'small' ? spacing.sm / 2 : 0,
      flexShrink: 1,
    },
  });