import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DeviceRepository } from '../../domain/DeviceRepository';
import type { Device } from '../../domain/type';
import {
  formatErrorTitle,
  formatReadout,
  formatSyncBadge,
} from '../format/readout';
import { DimmerRail } from './DimmerRoll';
import { borderWidth, colors, radius, space, type } from '../theme/tokens';

const TYPE_LABEL: Record<Device['type'], string> = {
  light: 'LIGHT',
  plug: 'SMART PLUG',
  sensor: 'SENSOR',
};

type Props = {
  device: Device;
  repository: DeviceRepository;
  onEdit: () => void;
};

/** §6.3 universal device card: same shell for every protocol and type. */
export function DeviceCard({ device, repository, onEdit }: Props) {
  const online = device.status === 'online';
  const faulty = device.status !== 'online';
  /**
   * A sensor that has not reported yet holds the placeholder state
   * {temperature: 0, humidity: 0}. Showing "0.0°C" claims a measurement that
   * does not exist, so render a dash until the adapter marks it online. Values
   * are not used for this check: a working sensor may legitimately read 0.
   */
  const hasReading = device.type === 'sensor' && online;

  const togglePower = () => {
    if (device.type === 'sensor') return; // sensors are read-only
    void repository.send(device.id, { kind: 'setPower', on: !device.state.on });
  };

  /**
   * §6.4A: releasing the dimmer commits `{ on: pct > 0, brightness: pct }`.
   * A single command cannot carry both fields, so send the power change first
   * (the lamp may currently be off) and then the level.
   */
  const commitBrightness = async (brightness: number) => {
    const shouldBeOn = brightness > 0;
    try {
      if (device.type === 'light' && device.state.on !== shouldBeOn) {
        await repository.send(device.id, {
          kind: 'setPower',
          on: shouldBeOn,
        });
      }
      await repository.send(device.id, { kind: 'setBrightness', brightness });
    } catch {
      // The adapter already reports failures through its error event.
    }
  };

  return (
    <View style={[styles.card, faulty && styles.cardFaulty]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <View style={styles.metaRow}>
            <Text style={styles.badge}>{TYPE_LABEL[device.type]}</Text>
            {device.room ? (
              <Text style={styles.room}>{device.room}</Text>
            ) : null}
          </View>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {device.name}
          </Text>
        </View>
        <View style={styles.headerBadges}>
          <View
            style={[styles.pill, online ? styles.pillOnline : styles.pillFault]}
          >
            <Text
              style={[
                styles.pillText,
                online ? styles.pillTextOnline : styles.pillTextFault,
              ]}
            >
              {online ? 'ONLINE' : 'ERROR'}
            </Text>
          </View>
          <Text style={styles.sync}>{formatSyncBadge(device)}</Text>
        </View>
      </View>

      <View
        style={[styles.body, !online && styles.bodyDisabled]}
        pointerEvents={online ? 'auto' : 'none'}
      >
        {device.type === 'plug' ? (
          <>
            <View style={styles.bodyLeft}>
              <Text style={styles.label}>RELAY CIRCUIT</Text>
              <Text style={styles.readout}>{formatReadout(device)}</Text>
              <View
                style={[
                  styles.pill,
                  device.state.on ? styles.pillEnergized : styles.pillCut,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    device.state.on ? styles.pillTextOn : styles.pillTextMuted,
                  ]}
                >
                  {device.state.on ? 'ENERGIZED' : 'CUT'}
                </Text>
              </View>
            </View>
            <Rocker
              on={device.state.on}
              disabled={!online}
              onToggle={togglePower}
            />
          </>
        ) : null}

        {device.type === 'light' ? (
          <>
            <View style={styles.bodyLeft}>
              <Text style={styles.label}>ILLUMINATION</Text>
              <Text style={styles.readout}>{formatReadout(device)}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !online }}
              onPress={togglePower}
              disabled={!online}
              style={({ pressed }) => [
                styles.powerButton,
                device.state.on && styles.powerButtonOn,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.powerLabel,
                  device.state.on && styles.powerLabelOn,
                ]}
              >
                {device.state.on ? 'ON' : 'OFF'}
              </Text>
            </Pressable>
          </>
        ) : null}

        {device.type === 'sensor' ? (
          <View style={styles.sensorRow}>
            <View style={styles.metric}>
              <Text style={styles.label}>TEMP</Text>
              <Text style={styles.readout}>
                {hasReading ? `${device.state.temperature.toFixed(1)}°C` : '—'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.metric}>
              <Text style={styles.label}>HUMIDITY</Text>
              <Text style={styles.readout}>
                {hasReading ? `${Math.round(device.state.humidity)}%` : '—'}
              </Text>
            </View>
            <View style={styles.telemetryTag}>
              <Text style={styles.telemetryTagText}>READ-ONLY</Text>
            </View>
          </View>
        ) : null}
      </View>

      {device.type === 'light' ? (
        <View style={[styles.dimmerWrap, !online && styles.bodyDisabled]}>
          <DimmerRail
            value={device.state.brightness}
            disabled={!online}
            onCommit={brightness => void commitBrightness(brightness)}
          />
        </View>
      ) : null}

      {faulty ? (
        <View style={styles.banner}>
          <View style={styles.bannerStripe} />
          <Text style={styles.bannerTitle}>
            {formatErrorTitle(device.errorType)}
          </Text>
          <Text style={styles.bannerMessage}>
            {device.errorMessage ??
              (device.config.protocol === 'mqtt'
                ? `Tidak ada pesan status di ${device.config.topicPrefix}/${device.id}/status.`
                : `Tidak ada respons dari ${device.config.baseUrl}/devices/${device.id}.`)}
          </Text>
          <View style={styles.bannerActions}>
            {(() => {
              // Retrying a wrong URL only repeats the same 404; EDIT CONFIG is the
              // action that can fix it.
              const retryUseful = device.errorType !== 'wrong_url';
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !retryUseful }}
                  disabled={!retryUseful}
                  onPress={() => void repository.restart(device)}
                  style={({ pressed }) => [
                    styles.bannerButton,
                    !retryUseful && styles.bannerButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.bannerButtonText,
                      !retryUseful && styles.textMuted,
                    ]}
                  >
                    ↻ RETRY
                  </Text>
                </Pressable>
              );
            })()}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit device config"
              onPress={onEdit}
              style={({ pressed }) => [
                styles.bannerButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.bannerButtonText}>EDIT CONFIG</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footerState} numberOfLines={1}>
          STATE: {formatReadout(device)}
        </Text>
        <View style={styles.footerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${device.name}`}
            onPress={onEdit}
          >
            <Text style={styles.footerButton}>EDIT</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

type RockerProps = {
  on: boolean;
  disabled: boolean;
  onToggle: () => void;
};

/** §6.4B mechanical rocker: I on top, LED slit in the middle, O below. */
function Rocker({ on, disabled, onToggle }: RockerProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Plug power"
      accessibilityState={{ checked: on, disabled }}
      onPress={onToggle}
      disabled={disabled}
      style={({ pressed }) => [styles.rockerHousing, pressed && styles.pressed]}
    >
      <Text style={[styles.rockerLabel, on && styles.rockerLabelActive]}>
        I
      </Text>
      <View style={[styles.rockerSlit, on && styles.rockerSlitOn]} />
      <Text style={[styles.rockerLabel, !on && styles.rockerLabelActive]}>
        O
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: borderWidth.card,
    borderColor: colors.border,
    marginBottom: space.sm,
    overflow: 'hidden',
  },
  cardFaulty: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: space.md,
    paddingTop: space.md,
  },
  headerText: { flex: 1, paddingRight: space.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  badge: {
    ...type.badge,
    color: colors.inkMuted,
    borderWidth: borderWidth.hairline,
    borderColor: colors.borderStrong,
    borderRadius: radius.badge,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  room: { ...type.badge, color: colors.inkMuted },
  name: { ...type.deviceName, color: colors.ink, marginTop: space.xxs },
  headerBadges: { alignItems: 'flex-end', gap: space.xxs },
  pill: {
    borderRadius: radius.badge,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: borderWidth.hairline,
    marginRight: 12,
  },
  pillOnline: {
    backgroundColor: colors.onlineSoft,
    borderColor: colors.online,
  },
  pillFault: { backgroundColor: colors.dangerBg, borderColor: colors.danger },
  pillEnergized: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  pillCut: { backgroundColor: colors.recessed, borderColor: colors.border },
  pillText: type.badge,
  pillTextOnline: { color: colors.online },
  pillTextFault: { color: colors.danger },
  pillTextOn: { color: colors.accent },
  pillTextMuted: { color: colors.inkMuted },
  sync: { ...type.badge, color: colors.inkMuted },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.md,
  },
  bodyDisabled: { opacity: 0.45 },
  bodyLeft: { flex: 1, gap: space.xxs },
  label: { ...type.badge, color: colors.inkMuted },
  readout: { ...type.telemetry, color: colors.ink },
  powerButton: {
    width: 66,
    height: 88,
    borderRadius: radius.control,
    borderWidth: borderWidth.card,
    borderColor: colors.borderStrong,
    backgroundColor: colors.recessed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerButtonOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  powerLabel: { ...type.action, color: colors.inkMuted },
  powerLabelOn: { color: '#FFFFFF' },
  rockerHousing: {
    width: 66,
    height: 88,
    borderRadius: radius.control,
    borderWidth: borderWidth.card,
    borderColor: colors.borderStrong,
    backgroundColor: colors.recessed,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.xs,
  },
  rockerLabel: { ...type.action, color: colors.inkMuted },
  rockerLabelActive: { color: colors.ink },
  rockerSlit: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  rockerSlitOn: { backgroundColor: colors.accent },
  sensorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: space.md,
  },
  metric: { flex: 1, gap: space.xxs },
  divider: {
    width: borderWidth.hairline,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
  },
  telemetryTag: {
    borderWidth: borderWidth.hairline,
    borderColor: colors.borderStrong,
    borderRadius: radius.badge,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  telemetryTagText: { ...type.badge, color: colors.inkMuted },
  banner: {
    marginHorizontal: space.md,
    marginBottom: space.md,
    borderRadius: radius.button,
    borderWidth: borderWidth.hairline,
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
    padding: space.xs,
    gap: space.xxs,
    overflow: 'hidden',
  },
  // Flat stand-in for the diagonal hazard stripe in §6.5; the striped version
  // needs a pattern asset and belongs to the polish pass, not M3.
  bannerStripe: {
    height: 6,
    marginHorizontal: -space.xs,
    marginTop: -space.xs,
    marginBottom: space.xxs,
    backgroundColor: colors.danger,
    opacity: 0.35,
  },
  bannerTitle: { ...type.badge, color: colors.danger },
  bannerMessage: { ...type.diagnostic, color: colors.ink },
  bannerActions: { flexDirection: 'row', gap: space.xs, marginTop: space.xxs },
  bannerButton: {
    flex: 1,
    borderRadius: radius.badge,
    borderWidth: borderWidth.hairline,
    borderColor: colors.danger,
    paddingVertical: 6,
    alignItems: 'center',
  },
  bannerButtonDisabled: { borderColor: colors.border },
  bannerButtonText: { ...type.action, color: colors.danger },
  dimmerWrap: {
    paddingHorizontal: space.md,
    paddingBottom: space.md,
    marginTop: -space.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.recessed,
    borderTopWidth: borderWidth.hairline,
    borderTopColor: colors.border,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  footerState: { ...type.diagnostic, color: colors.inkMuted, flex: 1 },
  footerActions: { flexDirection: 'row', gap: space.sm },
  footerButton: { ...type.action, color: colors.ink },
  textMuted: { color: colors.inkMuted },
  pressed: { opacity: 0.85 },
});
