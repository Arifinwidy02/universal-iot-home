import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DeviceDraft } from '../../domain/createDevice';
import { borderWidth, colors, radius, space, type } from '../theme/tokens';
import {
  ROOMS,
  type Device,
  type DeviceType,
  type Protocol,
  type Room,
} from '../../domain/type';

const TYPES: DeviceType[] = ['light', 'plug', 'sensor'];
const PROTOCOLS: Protocol[] = ['mqtt', 'http'];

type Props = {
  visible: boolean;
  device: Device | null;
  onClose: () => void;
  onSave: (draft: DeviceDraft) => void;
  onDelete: (id: string) => void;
};

export function DeviceSheet({
  visible,
  device,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [room, setRoom] = useState<Room | undefined>();
  const [deviceType, setDeviceType] = useState<DeviceType>('plug');
  const [protocol, setProtocol] = useState<Protocol>('http');
  const [brokerUrl, setBrokerUrl] = useState('ws://10.0.2.2:9001');
  const [topicPrefix, setTopicPrefix] = useState('home');
  const [baseUrl, setBaseUrl] = useState('http://10.0.2.2:3000');
  const [error, setError] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(device?.name ?? '');
    setRoom(device?.room);
    setDeviceType(device?.type ?? 'plug');
    setError(null);
    setArmed(false);
    if (device?.config.protocol === 'mqtt') {
      setProtocol('mqtt');
      setBrokerUrl(device.config.brokerUrl);
      setTopicPrefix(device.config.topicPrefix);
    } else if (device?.config.protocol === 'http') {
      setProtocol('http');
      setBaseUrl(device.config.baseUrl);
    }
  }, [visible, device]);

  const previewId = device?.id ?? '(id dibuat dari nama)';

  function submit() {
    if (!name.trim()) return setError('Device name wajib diisi.');
    if (protocol === 'mqtt') {
      if (!/^wss?:\/\//.test(brokerUrl)) {
        return setError(
          'Broker URL harus diawali ws:// atau wss:// — React Native tidak bisa membuka mqtt://.',
        );
      }
      if (!topicPrefix.trim()) return setError('Topic prefix wajib diisi.');
    } else if (!/^https?:\/\//.test(baseUrl)) {
      return setError('Base URL harus diawali http:// atau https://.');
    }
    setError(null);
    onSave({
      id: device?.id ?? '',
      name: name.trim(),
      room,
      type: deviceType,
      config:
        protocol === 'mqtt'
          ? {
              protocol: 'mqtt',
              brokerUrl: brokerUrl.trim(),
              topicPrefix: topicPrefix.trim(),
            }
          : { protocol: 'http', baseUrl: baseUrl.trim() },
    });
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[styles.sheet, { paddingBottom: space.xl + insets.bottom }]}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.subtitle}>PATCHBAY // ADAPTER CONFIG</Text>
              <Text style={styles.title}>
                {device ? 'EDIT DEVICE' : 'ADD DEVICE'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
            >
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <ScrollView style={styles.scroll}>
            <Text style={styles.label}>DEVICE NAME *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Studio Desk Lamp"
              placeholderTextColor={colors.inkMuted}
            />

            <Text style={styles.label}>ROOM / ZONE</Text>
            <View style={styles.chipRow}>
              {ROOMS.map(r => (
                <Pressable
                  key={r}
                  onPress={() => setRoom(room === r ? undefined : r)}
                  style={[styles.chip, room === r && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      room === r && styles.chipTextActive,
                    ]}
                  >
                    {r}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>DEVICE TYPE</Text>
            <View style={styles.segment}>
              {TYPES.map(t => (
                <Pressable
                  key={t}
                  onPress={() => setDeviceType(t)}
                  style={[
                    styles.segmentItem,
                    deviceType === t && styles.segmentActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      deviceType === t && styles.segmentTextActive,
                    ]}
                  >
                    {t === 'plug' ? 'SMART PLUG' : t.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>PROTOCOL ADAPTER</Text>
            <View style={styles.segment}>
              {PROTOCOLS.map(p => (
                <Pressable
                  key={p}
                  onPress={() => setProtocol(p)}
                  style={[
                    styles.segmentItem,
                    protocol === p && styles.segmentActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      protocol === p && styles.segmentTextActive,
                    ]}
                  >
                    {p === 'mqtt' ? 'MQTT' : 'HTTP (REST)'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.panel}>
              {protocol === 'mqtt' ? (
                <>
                  <Text style={styles.label}>BROKER URL *</Text>
                  <TextInput
                    value={brokerUrl}
                    onChangeText={setBrokerUrl}
                    autoCapitalize="none"
                    style={styles.input}
                  />
                  <Text style={styles.label}>DEVICE TOPIC PREFIX *</Text>
                  <TextInput
                    value={topicPrefix}
                    onChangeText={setTopicPrefix}
                    autoCapitalize="none"
                    style={styles.input}
                  />
                  <Text style={styles.preview}>
                    SUB {topicPrefix}/{previewId}/state{'\n'}PUB {topicPrefix}/
                    {previewId}/set{'\n'}LWT {topicPrefix}/{previewId}/status
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.label}>BASE URL *</Text>
                  <TextInput
                    value={baseUrl}
                    onChangeText={setBaseUrl}
                    autoCapitalize="none"
                    style={styles.input}
                  />
                  <Text style={styles.preview}>
                    GET {baseUrl}/devices/{previewId}
                    {'\n'}POST {baseUrl}/devices/{previewId}/set
                  </Text>
                </>
              )}
            </View>
          </ScrollView>

          <Pressable onPress={submit} style={styles.primary}>
            <Text style={styles.primaryText}>
              {device ? 'SAVE CHANGES' : 'SAVE DEVICE'}
            </Text>
          </Pressable>

          {device ? (
            armed ? (
              <View style={styles.footerRow}>
                <Pressable
                  onPress={() => setArmed(false)}
                  style={styles.footerButton}
                >
                  <Text style={styles.footerText}>CANCEL</Text>
                </Pressable>
                <Pressable
                  onPress={() => onDelete(device.id)}
                  style={[styles.footerButton, styles.dangerButton]}
                >
                  <Text style={[styles.footerText, { color: '#FFFFFF' }]}>
                    CONFIRM DELETE?
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => setArmed(true)}
                style={styles.footerButtonFull}
              >
                <Text style={[styles.footerText, { color: colors.danger }]}>
                  DELETE DEVICE
                </Text>
              </Pressable>
            )
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderTopWidth: borderWidth.card,
    borderColor: colors.borderStrong,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.xl,
    maxHeight: '90%',
  },
  scroll: { flexGrow: 0, flexShrink: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  subtitle: { ...type.badge, color: colors.inkMuted },
  title: { ...type.heading, color: colors.ink, marginTop: space.xxs },
  close: {
    ...type.heading,
    color: colors.inkMuted,
    paddingHorizontal: space.xs,
  },
  errorBanner: {
    backgroundColor: colors.dangerBg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.danger,
    borderRadius: radius.button,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    marginBottom: space.md,
  },
  errorText: { ...type.diagnostic, color: colors.danger },
  label: {
    ...type.badge,
    color: colors.inkMuted,
    marginTop: space.md,
    marginBottom: space.xxs,
  },
  input: {
    ...type.telemetry,
    fontSize: 14,
    fontWeight: '400',
    color: colors.ink,
    backgroundColor: colors.recessed,
    borderWidth: borderWidth.hairline,
    borderColor: colors.borderStrong,
    borderRadius: radius.input,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  chip: {
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    borderRadius: radius.badge,
    paddingHorizontal: space.xs,
    paddingVertical: 4,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { ...type.badge, color: colors.inkMuted },
  chipTextActive: { color: colors.canvas },
  segment: {
    flexDirection: 'row',
    borderWidth: borderWidth.hairline,
    borderColor: colors.borderStrong,
    borderRadius: radius.control,
    overflow: 'hidden',
  },
  segmentItem: {
    flex: 1,
    paddingVertical: space.xs,
    alignItems: 'center',
    backgroundColor: colors.recessed,
  },
  segmentActive: { backgroundColor: colors.ink },
  segmentText: { ...type.badge, color: colors.inkMuted },
  segmentTextActive: { color: colors.canvas },
  panel: {
    backgroundColor: colors.recessed,
    borderRadius: radius.control,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    paddingHorizontal: space.sm,
    paddingBottom: space.sm,
    marginTop: space.md,
  },
  preview: { ...type.diagnostic, color: colors.inkMuted, marginTop: space.xs },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: space.sm,
    alignItems: 'center',
    marginTop: space.lg,
  },
  primaryText: { ...type.action, color: '#FFFFFF' },
  footerRow: { flexDirection: 'row', gap: space.xs, marginTop: space.xs },
  footerButton: {
    flex: 1,
    flexShrink: 0,
    borderWidth: borderWidth.hairline,
    borderColor: colors.danger,
    borderRadius: radius.button,
    paddingVertical: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.xs,
  },
  footerButtonFull: {
    flexShrink: 0,
    borderWidth: borderWidth.hairline,
    borderColor: colors.danger,
    borderRadius: radius.button,
    paddingVertical: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.xs,
  },
  dangerButton: { backgroundColor: colors.danger },
  footerText: { ...type.action, color: colors.inkMuted },
});
