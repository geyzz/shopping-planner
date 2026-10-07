import { useAppTheme } from '@/theme/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function Avatar({ icon = 'user', image, size = 88 }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [failedUri, setFailedUri] = useState(null);

  const isValidUri = Boolean(
    image &&
    typeof image === 'string' &&
    image.trim().length > 0 &&
    image !== 'null' &&
    image !== 'undefined'
  );

  const hasFailed = isValidUri && failedUri === image;

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      {isValidUri && !hasFailed ? (
        <Image
          key={image}
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setFailedUri(image)}
        />
      ) : (
        <Feather name={icon} size={Math.round(size * 0.44)} color={colors.navy} />
      )}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    circle: {
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.gold,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
  });