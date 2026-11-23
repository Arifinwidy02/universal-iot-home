import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { borderWidth, colors, radius, space, type } from '../theme/tokens';

const house = require('../assets/images/house.png');

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.frame}>
        <Image
          source={house}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Placeholder drawing of a house"
        />
      </View>
      <Text style={styles.caption}>RELAY // OS · HOME SCREEN PLACEHOLDER</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 320,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.card,
    borderColor: colors.border,
    padding: space.xl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  caption: {
    ...type.badge,
    color: colors.inkMuted,
    marginTop: space.xl,
  },
});
