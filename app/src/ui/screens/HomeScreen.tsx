import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, space, type } from '../theme/tokens';

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
      <Text style={styles.caption}>Home screen, still a placeholder</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: space.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 320,
    borderRadius: radius.frame,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    padding: space.lg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  caption: {
    ...type.caption,
    color: colors.muted,
    marginTop: space.lg,
  },
});
