import { isBrightness, isPercent } from './validate';
import type { ConnectionStatus, DeviceState, DeviceType } from '../model/type';

export type ParseResult =
  | { ok: true; state: DeviceState }
  | { ok: false; reason: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseState(type: DeviceType, payload: unknown): ParseResult {
  if (!isRecord(payload)) {
    return { ok: false, reason: 'Payload bukan objek JSON.' };
  }

  switch (type) {
    case 'light': {
      const { on, brightness } = payload;
      if (typeof on !== 'boolean') {
        return { ok: false, reason: 'Field "on" harus boolean.' };
      }
      if (!isBrightness(brightness)) {
        return {
          ok: false,
          reason: 'Field "brightness" harus bilangan bulat 0-100.',
        };
      }
      return { ok: true, state: { on, brightness } };
    }

    case 'plug': {
      const { on } = payload;
      if (typeof on !== 'boolean') {
        return { ok: false, reason: 'Field "on" harus boolean.' };
      }
      return { ok: true, state: { on } };
    }

    case 'sensor': {
      const { temperature, humidity } = payload;
      if (typeof temperature !== 'number' || !Number.isFinite(temperature)) {
        return { ok: false, reason: 'Field "temperature" harus angka.' };
      }
      if (!isPercent(humidity)) {
        return { ok: false, reason: 'Field "humidity" harus angka 0-100.' };
      }
      return { ok: true, state: { temperature, humidity } };
    }
  }
}

export function parseStatus(payload: unknown): ConnectionStatus | null {
  if (payload === 'online' || payload === 'offline') {
    return payload;
  }
  return null;
}
