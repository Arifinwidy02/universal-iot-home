export type DeviceCommand =
  | { kind: 'setPower'; on: boolean }
  | { kind: 'setBrightness'; brightness: number };

export type SetPayload = { on?: boolean; brightness?: number };

export function commandToPayload(command: DeviceCommand): SetPayload {
  switch (command.kind) {
    case 'setPower':
      return { on: command.on };
    case 'setBrightness':
      return { brightness: command.brightness };
  }
}
