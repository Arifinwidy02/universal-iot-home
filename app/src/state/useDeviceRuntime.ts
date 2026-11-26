// app/src/state/useDeviceRuntime.ts
import { useEffect, useMemo, useRef } from 'react';
import { AdapterRegistry } from '../domain/connection/AdapterRegistry';
import { DeviceRepository } from '../domain/connection/DeviceRepository';
import { createHttpAdapter } from '../adapters/http/HttpAdapter';
import { createMqttAdapter } from '../adapters/mqtt/MqttAdapter';
import { useAppDispatch, useAppSelector } from './hooks';
import {
  errorReceived,
  stateReceived,
  statusReceived,
} from './slices/devicesSlice';
import type { Device } from '../domain/model/type';

const registry = new AdapterRegistry();
registry.register('http', device => createHttpAdapter(device));
registry.register('mqtt', device => createMqttAdapter(device));

export function useDeviceRuntime() {
  const dispatch = useAppDispatch();
  const devices = useAppSelector(state => state.devices.items);
  const repository = useMemo(() => new DeviceRepository(registry), []);
  const running = useRef(new Map<string, string>());

  useEffect(() => {
    const keyOf = (d: Device) =>
      `${d.config.protocol}|${JSON.stringify(d.config)}`;

    devices.forEach(device => {
      const key = keyOf(device);
      const current = running.current.get(device.id);
      if (current === key) return; // already running with this config

      void repository.stop(device.id).then(() =>
        repository.start(device, (id, event) => {
          if (event.type === 'state')
            dispatch(stateReceived({ id, state: event.state }));
          if (event.type === 'status')
            dispatch(statusReceived({ id, status: event.status }));
          if (event.type === 'error') {
            dispatch(
              errorReceived({
                id,
                errorType: event.error.kind,
                message: event.error.message,
              }),
            );
          }
        }),
      );
      running.current.set(device.id, key);
    });

    const ids = new Set(devices.map(d => d.id));
    running.current.forEach((_, id) => {
      if (!ids.has(id)) {
        void repository.stop(id);
        running.current.delete(id);
      }
    });
  }, [devices, dispatch, repository]);

  useEffect(() => {
    const map = running.current;
    return () => {
      map.forEach((_, id) => void repository.stop(id));
      map.clear();
    };
  }, [repository]);

  return repository;
}
