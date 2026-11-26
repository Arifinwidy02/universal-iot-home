export type AppErrorKind =
  | 'broker_unreachable'
  | 'wrong_url'
  | 'device_offline'
  | 'request_timeout';

export type AppError = {
  kind: AppErrorKind;
  message: string; // --> for UI
  cause?: unknown; // --> for logs only
};

const DEFAULT_MESSAGES: Record<AppErrorKind, string> = {
  broker_unreachable: 'Tidak bisa terhubung ke broker MQTT.',
  wrong_url: 'Alamat perangkat tidak valid.',
  device_offline: 'Perangkat sedang offline.',
  request_timeout: 'Perangkat tidak merespons tepat waktu.',
};

export function makeAppError(
  kind: AppErrorKind,
  cause?: unknown,
  message?: string,
): AppError {
  return { kind, cause, message: message ?? DEFAULT_MESSAGES[kind] };
}

export function isAppError(value: unknown): value is AppError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const kind = (value as { kind?: unknown }).kind;
  return typeof kind === 'string' && kind in DEFAULT_MESSAGES;
}
