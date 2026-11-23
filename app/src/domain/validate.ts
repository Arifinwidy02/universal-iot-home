import { DeviceCommand } from './command';
import { Device } from './type';

export type CommandRejection =
  | { kind: 'ReadOnlyDevice'; message: string }
  | { kind: 'UnsupportedCommand'; message: string }
  | { kind: 'InvalidBrightness'; message: string; value: number };

export type CommandCheck =
  | { ok: true }
  | { ok: false; rejection: CommandRejection };

/** Brightness is a whole percent, 0-100 inclusive. */
export function isBrightness(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 100
  );
}

/** Humidity / any 0-100 value; decimals allowed. */
export function isPercent(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}

export function checkCommand(
  device: Device,
  command: DeviceCommand,
): CommandCheck {
  if (device.type === 'sensor') {
    return {
      ok: false,
      rejection: {
        kind: 'ReadOnlyDevice',
        message: `"${device.name}" adalah sensor dan hanya bisa dibaca.`,
      },
    };
  }

  if (device.type === 'plug' && command.kind !== 'setPower') {
    return {
      ok: false,
      rejection: {
        kind: 'UnsupportedCommand',
        message: `"${device.name}" tidak mendukung perintah ${command.kind}.`,
      },
    };
  }

  if (command.kind === 'setBrightness' && !isBrightness(command.brightness)) {
    return {
      ok: false,
      rejection: {
        kind: 'InvalidBrightness',
        message: 'Brightness harus bilangan bulat 0-100.',
        value: command.brightness,
      },
    };
  }

  return { ok: true };
}

export function canAcceptCommand(
  device: Device,
  command: DeviceCommand,
): boolean {
  return checkCommand(device, command).ok;
}
