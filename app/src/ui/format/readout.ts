import type { Device, DeviceErrorType } from '../../domain/model/type';

const ERROR_TITLES: Record<DeviceErrorType, string> = {
  broker_unreachable: 'BROKER UNREACHABLE',
  wrong_url: 'WRONG URL (404)',
  device_offline: 'DEVICE OFFLINE',
  request_timeout: 'REQUEST TIMEOUT',
};

export function formatErrorTitle(errorType: DeviceErrorType | null): string {
  return errorType ? ERROR_TITLES[errorType] : 'ERROR';
}

export function formatReadout(device: Device): string {
  if (device.status !== 'online') {
    return formatErrorTitle(device.errorType);
  }
  switch (device.type) {
    case 'light':
      return device.state.on
        ? `On, ${Math.round(device.state.brightness)}%`
        : 'Off';
    case 'plug':
      return device.state.on ? 'On' : 'Off';
    case 'sensor':
      return `${device.state.temperature.toFixed(1)}°C · ${Math.round(
        device.state.humidity,
      )}% RH`;
  }
}

export function formatSyncBadge(device: Device): string {
  return device.config.protocol === 'mqtt' ? 'MQTT • SUB' : 'HTTP • POLL 3s';
}
