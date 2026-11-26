import { EventEmitter } from "node:events";
import { seedDevices } from "../data/devices";
import {
  ALLOWED_FIELDS,
  type Device,
  type DeviceState,
  type PatchSource,
  type StatePatch,
} from "../types";

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

const isPercent = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 100;

/** Field rules shared by HTTP, MQTT and the sensor ticker. */
export function validatePatch(device: Device, patch: unknown): string | null {
  if (typeof patch !== "object" || patch === null || Array.isArray(patch)) {
    return "Payload must be a JSON object.";
  }

  const entries = Object.entries(patch as Record<string, unknown>);
  if (entries.length === 0) {
    return "Payload is empty.";
  }

  const allowed = ALLOWED_FIELDS[device.type];
  for (const [key, value] of entries) {
    if (!allowed.includes(key as keyof StatePatch)) {
      return `Unknown field "${key}" for ${device.type}.`;
    }

    switch (key) {
      case "on":
        if (typeof value !== "boolean") {
          return '"on" must be a boolean.';
        }
        break;
      case "brightness":
        if (!(Number.isInteger(value) && isPercent(value))) {
          return '"brightness" must be an integer 0-100.';
        }
        break;
      case "humidity":
        if (!isPercent(value)) {
          return '"humidity" must be a number 0-100.';
        }
        break;
      case "temperature":
        if (
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          value < -40 ||
          value > 80
        ) {
          return '"temperature" must be a number between -40 and 80.';
        }
        break;
      default:
        return `Unknown field "${key}".`;
    }
  }

  return null;
}

type DeviceEvents = { state: [Device] };

export class DeviceService extends EventEmitter<DeviceEvents> {
  private readonly devices: Map<string, Device>;

  constructor(devices: Device[]) {
    super();
    this.devices = new Map(
      devices.map((device) => [device.id, structuredClone(device)]),
    );
  }

  list(): Device[] {
    return [...this.devices.values()];
  }

  find(id: string): Device {
    const device = this.devices.get(id);
    if (!device) {
      throw new HttpError(404, `Unknown device "${id}".`);
    }
    return device;
  }

  getState(id: string): DeviceState {
    return this.find(id).state;
  }

  /**
   * source:
   *   'app'    - a command from the app; a sensor is read-only
   *   'admin'  - simulator-only override, allowed on every type
   *   'device' - the device itself changed (sensor ticker)
   */
  apply(
    id: string,
    patch: unknown,
    { source = "app" }: { source?: PatchSource } = {},
  ): DeviceState {
    const device = this.find(id);

    if (device.type === "sensor" && source === "app") {
      throw new HttpError(400, "Sensor is read-only.");
    }

    const error = validatePatch(device, patch);
    if (error) {
      throw new HttpError(400, error);
    }

    // validatePatch guarantees the shape, so the cast is safe here.
    Object.assign(device.state, patch as StatePatch);
    this.emit("state", device);
    return device.state;
  }

  /** Random walk, so the sensor looks alive without any app polling it. */
  tickSensor(id: string): void {
    const sensor = this.find(id);
    if (sensor.type !== "sensor") {
      throw new HttpError(400, `"${id}" is not a sensor.`);
    }

    const drift = (
      value: number,
      min: number,
      max: number,
      step: number,
    ): number =>
      Math.min(max, Math.max(min, value + (Math.random() - 0.5) * step));

    this.apply(
      id,
      {
        temperature:
          Math.round(drift(sensor.state.temperature, 18, 32, 0.6) * 10) / 10,
        humidity: Math.round(drift(sensor.state.humidity, 30, 80, 4)),
      },
      { source: "device" },
    );
  }
}

export const deviceService = new DeviceService(seedDevices);
