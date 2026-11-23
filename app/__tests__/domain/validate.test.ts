import {
  canAcceptCommand,
  checkCommand,
  isBrightness,
} from '../../src/domain/validate';
import type { Device } from '../../src/domain/type';

const light: Device = {
  id: 'light-1',
  name: 'Lampu Ruang Tamu',
  room: 'LIVING',
  config: { protocol: 'http', baseUrl: 'http://10.0.2.2:3000' },
  type: 'light',
  state: { on: false, brightness: 70 },
  status: 'online',
  errorType: null,
  errorMessage: null,
};

const plug: Device = {
  id: 'plug-1',
  name: 'Colokan TV',
  config: { protocol: 'http', baseUrl: 'http://10.0.2.2:3000' },
  type: 'plug',
  state: { on: true },
  status: 'online',
  errorType: null,
  errorMessage: null,
};

const sensor: Device = {
  id: 'sensor-1',
  name: 'Sensor Dapur',
  room: 'KITCHEN',
  config: {
    protocol: 'mqtt',
    brokerUrl: 'ws://10.0.2.2:9001',
    topicPrefix: 'home',
  },
  type: 'sensor',
  state: { temperature: 26.5, humidity: 61 },
  status: 'online',
  errorType: null,
  errorMessage: null,
};

describe('isBrightness', () => {
  it('accepts the inclusive bounds and mid values', () => {
    expect(isBrightness(0)).toBe(true);
    expect(isBrightness(50)).toBe(true);
    expect(isBrightness(100)).toBe(true);
  });

  it('rejects out-of-range, fractional and non-numeric values', () => {
    expect(isBrightness(-1)).toBe(false);
    expect(isBrightness(101)).toBe(false);
    expect(isBrightness(50.5)).toBe(false);
    expect(isBrightness('50')).toBe(false);
    expect(isBrightness(Number.NaN)).toBe(false);
    expect(isBrightness(null)).toBe(false);
  });
});

describe('checkCommand', () => {
  it('allows power and valid brightness on a light', () => {
    expect(canAcceptCommand(light, { kind: 'setPower', on: true })).toBe(true);
    expect(
      canAcceptCommand(light, { kind: 'setBrightness', brightness: 0 }),
    ).toBe(true);
    expect(
      canAcceptCommand(light, { kind: 'setBrightness', brightness: 100 }),
    ).toBe(true);
  });

  it('rejects brightness outside 0-100 with a typed rejection', () => {
    const result = checkCommand(light, {
      kind: 'setBrightness',
      brightness: 101,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.rejection.kind).toBe('InvalidBrightness');
    }
  });

  it('rejects every command for a sensor', () => {
    const power = checkCommand(sensor, { kind: 'setPower', on: true });
    const brightness = checkCommand(sensor, {
      kind: 'setBrightness',
      brightness: 40,
    });

    expect(power.ok).toBe(false);
    expect(brightness.ok).toBe(false);
    if (!power.ok && !brightness.ok) {
      expect(power.rejection.kind).toBe('ReadOnlyDevice');
      expect(brightness.rejection.kind).toBe('ReadOnlyDevice');
    }
  });

  it('allows power but not brightness on a plug', () => {
    expect(canAcceptCommand(plug, { kind: 'setPower', on: false })).toBe(true);
    const result = checkCommand(plug, {
      kind: 'setBrightness',
      brightness: 30,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.rejection.kind).toBe('UnsupportedCommand');
    }
  });
});
