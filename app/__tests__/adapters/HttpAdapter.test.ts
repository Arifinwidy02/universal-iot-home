import { HttpAdapter } from '../../src/adapters/http/HttpAdapter';
import type { PlugDevice } from '../../src/domain/model/type';

const plug: PlugDevice = {
  id: 'plug-1',
  name: 'Living Room Plug',
  type: 'plug',
  config: { protocol: 'http', baseUrl: 'http://10.0.2.2:3000/' },
  status: 'offline',
  errorType: null,
  errorMessage: null,
  state: { on: false },
};

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe('HttpAdapter', () => {
  it('polls the device URL and emits the parsed state', async () => {
    const calls: string[] = [];
    const fetchImpl = jest.fn(async (url: string) => {
      calls.push(String(url));
      return jsonResponse({ on: true });
    }) as unknown as typeof fetch;

    const adapter = new HttpAdapter(plug, { fetchImpl });
    const events: any[] = [];
    adapter.subscribe(e => events.push(e));

    await adapter.connect();
    await Promise.resolve();

    expect(calls[0]).toBe('http://10.0.2.2:3000/devices/plug-1');
    expect(events).toContainEqual({ type: 'state', state: { on: true } });
    expect(events).toContainEqual({ type: 'status', status: 'online' });
    await adapter.disconnect();
  });

  it('maps 404 to wrong_url', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({}, 404),
    ) as unknown as typeof fetch;
    const adapter = new HttpAdapter(plug, { fetchImpl });
    const events: any[] = [];
    adapter.subscribe(e => events.push(e));

    await adapter.connect();
    await Promise.resolve();

    const error = events.find(e => e.type === 'error');
    expect(error.error.kind).toBe('wrong_url');
    await adapter.disconnect();
  });

  it('sends a set command and emits the confirmed state', async () => {
    const posts: { url: string; body: string }[] = [];
    const fetchImpl = jest.fn(async (url: string, init: RequestInit) => {
      // connect() polls first with a GET that has no body; only record writes.
      if (init.method === 'POST') {
        posts.push({ url: String(url), body: String(init.body) });
      }
      return jsonResponse({ on: true });
    }) as unknown as typeof fetch;

    const adapter = new HttpAdapter(plug, { fetchImpl });
    const events: any[] = [];
    adapter.subscribe(e => events.push(e));

    await adapter.connect();
    await adapter.send({ kind: 'setPower', on: true });

    expect(posts).toHaveLength(1);
    expect(posts[0].url).toBe('http://10.0.2.2:3000/devices/plug-1/set');
    expect(JSON.parse(posts[0].body)).toEqual({ on: true });
    expect(events).toContainEqual({ type: 'state', state: { on: true } });
    await adapter.disconnect();
  });
});
