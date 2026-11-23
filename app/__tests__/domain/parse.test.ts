import { parseState, parseStatus } from '../../src/domain/parse';

describe('parseState', () => {
  it('parses a light state and keeps only known fields', () => {
    expect(
      parseState('light', { on: true, brightness: 70, extra: 'x' }),
    ).toEqual({
      ok: true,
      state: { on: true, brightness: 70 },
    });
  });

  it('parses a plug state', () => {
    expect(parseState('plug', { on: false })).toEqual({
      ok: true,
      state: { on: false },
    });
  });

  it('parses a sensor state', () => {
    expect(parseState('sensor', { temperature: 26.5, humidity: 61 })).toEqual({
      ok: true,
      state: { temperature: 26.5, humidity: 61 },
    });
  });

  it('rejects a non-object payload', () => {
    expect(parseState('light', 'online').ok).toBe(false);
    expect(parseState('light', null).ok).toBe(false);
    expect(parseState('light', [1, 2]).ok).toBe(false);
  });

  it('rejects a wrong or missing field', () => {
    expect(parseState('light', { on: 'true', brightness: 50 }).ok).toBe(false);
    expect(parseState('light', { on: true }).ok).toBe(false);
    expect(parseState('plug', {}).ok).toBe(false);
  });

  it('rejects brightness and humidity out of range', () => {
    expect(parseState('light', { on: true, brightness: 101 }).ok).toBe(false);
    expect(parseState('light', { on: true, brightness: 12.5 }).ok).toBe(false);
    expect(parseState('sensor', { temperature: 26.5, humidity: 101 }).ok).toBe(
      false,
    );
    expect(parseState('sensor', { temperature: 'warm', humidity: 60 }).ok).toBe(
      false,
    );
  });
});

describe('parseStatus', () => {
  it('accepts only the two known strings', () => {
    expect(parseStatus('online')).toBe('online');
    expect(parseStatus('offline')).toBe('offline');
    expect(parseStatus('away')).toBeNull();
    expect(parseStatus(1)).toBeNull();
  });
});
