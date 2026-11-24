// app/src/ui/screens/DeviceListScreen.tsx
import { Platform, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Device } from '../../domain/type';
import { useDeviceRuntime } from '../../state/useDeviceRuntime';
import { useAppSelector } from '../../state/hooks';
import { colors, space, type } from '../theme/tokens';
import { DeviceCard } from '../components/DeviceCard';

const seed: Device[] = [
  {
    id: 'plug-1',
    name: 'Living Room Plug',
    room: 'LIVING',
    type: 'plug',
    config: {
      protocol: 'http',
      baseUrl: Platform.select({
        android: 'http://10.0.2.2:3000',
        default: 'http://localhost:3000',
      })!,
    },
    status: 'offline',
    errorType: null,
    errorMessage: null,
    state: { on: false },
  },
];

export function DeviceListScreen() {
  const repository = useDeviceRuntime(seed);
  const devices = useAppSelector(state => state.devices.items);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Text style={styles.title}>RELAY // OS</Text>
      {devices.map(device => (
        <DeviceCard key={device.id} device={device} repository={repository} />
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: space.lg,
  },
  title: { ...type.wordmark, color: colors.ink, marginVertical: space.lg },
});
