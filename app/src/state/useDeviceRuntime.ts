// app/src/state/useDeviceRuntime.ts
import { useEffect, useMemo } from 'react';
import { AdapterRegistry } from '../domain/AdapterRegistry';
import { DeviceRepository } from '../domain/DeviceRepository';
import { createHttpAdapter } from '../adapters/http/HttpAdapter';
import { useAppDispatch } from './hooks';
import {
  deviceAdded,
  errorReceived,
  stateReceived,
  statusReceived,
} from './slices/devicesSlice';
import { createMqttAdapter } from '../adapters/mqtt/MqttAdapter';
import { Device } from '../domain/type';

const registry = new AdapterRegistry();
registry.register('http', device => createHttpAdapter(device));
registry.register('mqtt', device => createMqttAdapter(device));

export function useDeviceRuntime(seed: Device[]) {
  const dispatch = useAppDispatch();
  const repository = useMemo(() => new DeviceRepository(registry), []);

  useEffect(() => {
    seed.forEach(d => dispatch(deviceAdded(d)));
    seed.forEach(device => {
      void repository.start(device, (id, event) => {
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
      });
    });
    return () => {
      seed.forEach(d => void repository.stop(d.id));
    };
  }, [dispatch, repository, seed]);

  return repository;
}
