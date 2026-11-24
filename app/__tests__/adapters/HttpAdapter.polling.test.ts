import { HttpAdapter } from '../../src/adapters/http/HttpAdapter';
import type { PlugDevice } from '../../src/domain/type';

const plug: PlugDevice = {
  id: 'plug-1',
  name: 'Living Room Plug',
  type: 'plug',
  config: { protocol: 'http', baseUrl: 'http://10.0.2.2:3000' },
  status: 'offline',
  errorType: null,
  errorMessage: null,
  state: { on: false },
};

function ok(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as unknown as Response;
}

describe('HttpAdapter polling', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('polls again after the interval elapses', async () => {
    let calls = 0;
    const fetchImpl = jest.fn(async () => {
      calls += 1;
      return ok({ on: calls > 1 });
    }) as unknown as typeof fetch;

    const adapter = new HttpAdapter(plug, { fetchImpl, pollingMs: 3000 });
    await adapter.connect();
    await Promise.resolve();
    expect(calls).toBe(1);

    await jest.advanceTimersByTimeAsync(3000);
    expect(calls).toBe(2);

    await jest.advanceTimersByTimeAsync(3000);
    expect(calls).toBe(3);

    await adapter.disconnect();
  });

  it('stops polling after disconnect', async () => {
    let calls = 0;
    const fetchImpl = jest.fn(async () => {
      calls += 1;
      return ok({ on: false });
    }) as unknown as typeof fetch;

    const adapter = new HttpAdapter(plug, { fetchImpl, pollingMs: 3000 });
    await adapter.connect();
    await Promise.resolve();
    await adapter.disconnect();

    const afterStop = calls;
    await jest.advanceTimersByTimeAsync(10000);
    expect(calls).toBe(afterStop);
  });

  it('recovers to online on the first successful poll after a failure', async () => {
    let attempt = 0;
    const fetchImpl = jest.fn(async () => {
      attempt += 1;
      if (attempt === 1) throw new TypeError('fetch failed');
      return ok({ on: true });
    }) as unknown as typeof fetch;

    const adapter = new HttpAdapter(plug, { fetchImpl, pollingMs: 3000 });
    const events: any[] = [];
    adapter.subscribe(e => events.push(e));

    await adapter.connect();
    await Promise.resolve();
    expect(events).toContainEqual({ type: 'status', status: 'offline' });
    expect(events.find(e => e.type === 'error')).toBeTruthy();

    events.length = 0;
    await jest.advanceTimersByTimeAsync(3000);

    expect(events).toContainEqual({ type: 'status', status: 'online' });
    expect(events).toContainEqual({ type: 'state', state: { on: true } });

    await adapter.disconnect();
  });

  it('leaves no pending timers after disconnect', async () => {
    const fetchImpl = jest.fn(async () =>
      ok({ on: false }),
    ) as unknown as typeof fetch;
    const adapter = new HttpAdapter(plug, { fetchImpl, pollingMs: 3000 });
    await adapter.connect();
    await Promise.resolve();
    await adapter.disconnect();
    expect(jest.getTimerCount()).toBe(0);
  });
});
