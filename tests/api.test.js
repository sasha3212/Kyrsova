import { afterEach, describe, expect, it, vi } from 'vitest';
import { createZone, fetchTracks, fetchZones, resolveMode } from '../src/api.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  };
}

describe('api', () => {
  it('resolves mock mode from a query string', () => {
    expect(resolveMode('?mock=air')).toBe('air');
    expect(resolveMode('')).toBe(null);
  });

  it('returns mock tracks without fetch', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const tracks = await fetchTracks({ search: '?mock=normal' });
    expect(tracks.length).toBeGreaterThan(5);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('throws for the error mock mode', async () => {
    await expect(fetchTracks({ search: '?mock=error' })).rejects.toThrow('Демонстраційна');
  });

  it('requests live tracks and unwraps items', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ items: [{ id: 'T1' }] }));
    vi.stubGlobal('fetch', fetchMock);
    const tracks = await fetchTracks({ search: '' });
    expect(tracks).toEqual([{ id: 'T1' }]);
    expect(fetchMock.mock.calls[0][0]).toContain('/api/v1/tracks');
  });

  it('returns mock zones', async () => {
    const zones = await fetchZones({ search: '?mock=normal' });
    expect(zones.length).toBeGreaterThan(2);
  });

  it('creates a zone locally in mock mode', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const zone = await createZone({
      name: 'Нова зона',
      type: 'restricted',
      polygon: [[30.7, 46.4], [30.8, 46.4], [30.8, 46.3]],
    }, { search: '?mock=normal' });
    expect(zone.id).toMatch(/zon-local-/);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects invalid zone data', async () => {
    await expect(createZone({ name: '', polygon: [] }, { search: '?mock=normal' })).rejects.toThrow('Некоректні');
  });

  it('posts JSON to the live API', async () => {
    const payload = {
      name: 'Нова зона', type: 'restricted',
      polygon: [[30.7, 46.4], [30.8, 46.4], [30.8, 46.3]],
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ...payload, id: 'zon-1' }, true, 201));
    vi.stubGlobal('fetch', fetchMock);
    const zone = await createZone(payload, { search: '' });
    expect(zone.id).toBe('zon-1');
    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body).name).toBe('Нова зона');
  });

  it('throws a readable error on failed responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ detail: 'Немає доступу' }, false, 403)));
    await expect(fetchTracks({ search: '' })).rejects.toThrow('Немає доступу');
  });
});
