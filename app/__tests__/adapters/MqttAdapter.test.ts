import { MqttAdapter } from '../../src/adapters/mqtt/MqttAdapter';
import type { LightDevice } from '../../src/domain/type';

const lamp: LightDevice = {
  id: 'light-1',
  name: 'Studio Desk Lamp',
  type: 'light',
  config: {
    protocol: 'mqtt',
    brokerUrl: 'ws://10.0.2.2:9001',
    topicPrefix: 'home',
  },
  status: 'offline',
  errorType: null,
  errorMessage: null,
  state: { on: false, brightness: 70 },
};

/** Minimal fake of the mqtt.js client surface the adapter uses. */
function fakeClient() {
  const handlers = new Map<string, ((...args: any[]) => void)[]>();
  const published: { topic: string; payload: string }[] = [];
  const subscriptions: string[] = [];
  const client = {
    connected: false,
    on(event: string, cb: (...args: any[]) => void) {
      handlers.set(event, [...(handlers.get(event) ?? []), cb]);
      return client;
    },
    subscribe(topics: string[]) {
      subscriptions.push(...topics);
    },
    publish(topic: string, payload: string) {
      published.push({ topic, payload });
    },
    end() {},
    emit(event: string, ...args: any[]) {
      (handlers.get(event) ?? []).forEach(cb => cb(...args));
    },
    connect() {
      client.connected = true;
      client.emit('connect');
    },
  };
  return { client, published, subscriptions };
}

describe('MqttAdapter', () => {
  it('subscribes to state and status on connect', async () => {
    const { client, subscriptions } = fakeClient();
    const adapter = new MqttAdapter(lamp, {
      connectFactory: () => client as any,
    });
    await adapter.connect();
    client.connect();

    expect(subscriptions).toEqual([
      'home/light-1/state',
      'home/light-1/status',
    ]);
    await adapter.disconnect();
  });

  it('emits parsed state from a retained message', async () => {
    const { client } = fakeClient();
    const adapter = new MqttAdapter(lamp, {
      connectFactory: () => client as any,
    });
    const events: any[] = [];
    adapter.subscribe(e => events.push(e));

    await adapter.connect();
    client.connect();
    client.emit(
      'message',
      'home/light-1/state',
      Buffer.from('{"on":true,"brightness":42}'),
    );

    expect(events).toContainEqual({
      type: 'state',
      state: { on: true, brightness: 42 },
    });
    await adapter.disconnect();
  });

  it('marks the device offline from the retained status message', async () => {
    const { client } = fakeClient();
    const adapter = new MqttAdapter(lamp, {
      connectFactory: () => client as any,
    });
    const events: any[] = [];
    adapter.subscribe(e => events.push(e));

    await adapter.connect();
    client.connect();
    client.emit('message', 'home/light-1/status', Buffer.from('offline'));

    expect(events).toContainEqual({ type: 'status', status: 'offline' });
    expect(events.find(e => e.type === 'error').error.kind).toBe(
      'device_offline',
    );
    await adapter.disconnect();
  });

  it('publishes a set command on the right topic with QoS 1 payload', async () => {
    const { client, published } = fakeClient();
    const adapter = new MqttAdapter(lamp, {
      connectFactory: () => client as any,
    });
    await adapter.connect();
    client.connect();

    await adapter.send({ kind: 'setPower', on: true });

    expect(published).toEqual([
      { topic: 'home/light-1/set', payload: '{"on":true}' },
    ]);
    await adapter.disconnect();
  });

  it('rejects a command while the broker link is down', async () => {
    const { client } = fakeClient();
    const adapter = new MqttAdapter(lamp, {
      connectFactory: () => client as any,
    });
    await adapter.connect();

    await expect(
      adapter.send({ kind: 'setPower', on: true }),
    ).rejects.toMatchObject({
      kind: 'device_offline',
    });
    await adapter.disconnect();
  });
});
