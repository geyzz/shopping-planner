import { typography } from '@/theme/theme';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';

const BRAND_BG = '#D6CDAC';
const BRAND_NAVY = '#1B2A4A';

export default function LoadingScreen({ showSpinner = true }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  return (
        <View style={styles.screen}>
            <Animated.Image
            source={require('../../../assets/images/transparent_logo.png')}
            style={[styles.logo, { transform: [{ scale }] }]}
        />
        <Text style={styles.name}>Plan_.ed</Text>
        {showSpinner && <ActivityIndicator style={styles.spinner} color={BRAND_NAVY} />}
    </View>
    );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_BG,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  name: {
    ...typography.heading,
    color: BRAND_NAVY,
    marginTop: 12,
  },
  spinner: {
    marginTop: 24,
  },
});