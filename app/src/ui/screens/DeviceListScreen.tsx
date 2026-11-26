import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import type { Device } from '../../domain/type';
import type { DeviceDraft } from '../../domain/createDevice';
import { makeDeviceId, toDevice } from '../../domain/createDevice';
import { useDeviceRuntime } from '../../state/useDeviceRuntime';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import {
  deviceAdded,
  deviceRemoved,
  deviceUpdated,
} from '../../state/slices/devicesSlice';
import { DeviceCard } from '../components/DeviceCard';
import { DeviceSheet } from '../components/DeviceSheet';
import { colors, radius, space, type } from '../theme/tokens';

export function DeviceListScreen() {
  const dispatch = useAppDispatch();
  const repository = useDeviceRuntime();
  const devices = useAppSelector(state => state.devices.items);

  const [sheetDevice, setSheetDevice] = useState<Device | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  function openAdd() {
    setSheetDevice(null);
    setSheetOpen(true);
  }

  function openEdit(device: Device) {
    setSheetDevice(device);
    setSheetOpen(true);
  }

  function save(draft: DeviceDraft) {
    if (sheetDevice) {
      dispatch(deviceUpdated({ id: sheetDevice.id, patch: draft }));
    } else {
      const id = makeDeviceId(
        draft.name,
        devices.map(d => d.id),
      );
      dispatch(deviceAdded(toDevice({ ...draft, id })));
    }
    setSheetOpen(false);
  }

  async function remove(id: string) {
    await repository.stop(id);
    dispatch(deviceRemoved({ id }));
    setSheetOpen(false);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>RELAY // OS</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add device"
          onPress={openAdd}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <Text style={styles.addButtonText}>+ ADD DEVICE</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {devices.length === 0 ? (
          <Text style={styles.empty}>
            Belum ada device. Tekan + ADD DEVICE untuk menambahkan.
          </Text>
        ) : (
          devices.map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              repository={repository}
              onEdit={() => openEdit(device)}
            />
          ))
        )}
      </ScrollView>

      <DeviceSheet
        visible={sheetOpen}
        device={sheetDevice}
        onClose={() => setSheetOpen(false)}
        onSave={save}
        onDelete={remove}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: space.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: space.lg,
  },
  title: { ...type.wordmark, color: colors.ink },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  addButtonText: { ...type.action, color: '#FFFFFF' },
  list: { paddingBottom: space.xxl },
  empty: {
    ...type.diagnostic,
    color: colors.inkMuted,
    marginTop: space.lg,
  },
  pressed: { opacity: 0.85 },
});
