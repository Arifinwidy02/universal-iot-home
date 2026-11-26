import {
  formatErrorTitle,
  formatReadout,
  formatSyncBadge,
} from '../../src/ui/format/readout';
import type { Device } from '../../src/domain/model/type';

function device(overrides: Partial<Device> & Pick<Device, 'type'>): Device {
  const base = {
    id: 'd-1',
    name: 'Test device',
    config: { protocol: 'http' as const, baseUrl: 'http://localhost:3000' },
    status: 'online' as const,
    errorType: null,
    errorMessage: null,
  };
  return { ...base, ...overrides } as Device;
}

describe('formatReadout — design system §7 strings', () => {
  it('renders a light that is on', () => {
    const light = device({
      type: 'light',
      state: { on: true, brightness: 70 },
    });
    expect(formatReadout(light)).toBe('On, 70%');
  });

  it('renders a light that is off without a percentage', () => {
    const light = device({
      type: 'light',
      state: { on: false, brightness: 40 },
    });
    expect(formatReadout(light)).toBe('Off');
  });

  it('rounds brightness to a whole percent', () => {
    const light = device({
      type: 'light',
      state: { on: true, brightness: 69.6 },
    });
    expect(formatReadout(light)).toBe('On, 70%');
  });

  it('renders a plug', () => {
    expect(formatReadout(device({ type: 'plug', state: { on: true } }))).toBe(
      'On',
    );
    expect(formatReadout(device({ type: 'plug', state: { on: false } }))).toBe(
      'Off',
    );
  });

  it('renders sensor telemetry with one decimal and a dot separator', () => {
    const sensor = device({
      type: 'sensor',
      state: { temperature: 26.5, humidity: 61 },
    });
    expect(formatReadout(sensor)).toBe('26.5°C · 61% RH');
  });

  it('keeps one decimal for whole-number temperatures', () => {
    const sensor = device({
      type: 'sensor',
      state: { temperature: 28, humidity: 40 },
    });
    expect(formatReadout(sensor)).toBe('28.0°C · 40% RH');
  });

  it('shows the error title instead of a state when the device is not online', () => {
    const offline = device({
      type: 'plug',
      state: { on: true },
      status: 'error',
      errorType: 'device_offline',
      errorMessage: 'Device offline — no response',
    });
    expect(formatReadout(offline)).toBe('DEVICE OFFLINE');
  });
});

describe('formatErrorTitle', () => {
  it('maps every AppError kind to its banner title', () => {
    expect(formatErrorTitle('broker_unreachable')).toBe('BROKER UNREACHABLE');
    expect(formatErrorTitle('wrong_url')).toBe('WRONG URL (404)');
    expect(formatErrorTitle('device_offline')).toBe('DEVICE OFFLINE');
    expect(formatErrorTitle('request_timeout')).toBe('REQUEST TIMEOUT');
  });

  it('falls back to ERROR when no kind is recorded', () => {
    expect(formatErrorTitle(null)).toBe('ERROR');
  });
});

describe('formatSyncBadge', () => {
  it('names the mechanism per protocol', () => {
    expect(
      formatSyncBadge(device({ type: 'plug', state: { on: false } })),
    ).toBe('HTTP • POLL 3s');
    expect(
      formatSyncBadge(
        device({
          type: 'plug',
          state: { on: false },
          config: {
            protocol: 'mqtt',
            brokerUrl: 'ws://localhost:9001',
            topicPrefix: 'home',
          },
        }),
      ),
    ).toBe('MQTT • SUB');
  });
  it('shows the error title, not a fake 0.0C, when a sensor has no reading', () => {
    const sensor = device({
      type: 'sensor',
      state: { temperature: 0, humidity: 0 },
      status: 'error',
      errorType: 'device_offline',
      errorMessage: 'Device offline — no status published',
    });

    expect(formatReadout(sensor)).toBe('DEVICE OFFLINE');
    expect(formatReadout(sensor)).not.toContain('°C');
  });
});
