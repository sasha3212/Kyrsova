import { describe, expect, it, vi } from 'vitest';
import { ZonesStore } from '../src/stores/ZonesStore.js';

const POLYGON = [[30.74, 46.47], [30.82, 46.47], [30.82, 46.4], [30.74, 46.4]];

function makeStore(search = '?mock=normal') {
  return new ZonesStore({ search, onZonesChanged: vi.fn() });
}

describe('ZonesStore', () => {
  it('loads mock zones', async () => {
    const store = makeStore();
    await store.start();
    expect(store.status).toBe('ready');
    expect(store.count).toBeGreaterThan(2);
    expect(store.onZonesChanged).toHaveBeenCalled();
  });

  it('creates a zone locally in mock mode', async () => {
    const store = makeStore();
    await store.load();
    const before = store.count;
    const ok = await store.create({ name: 'Нова зона', type: 'restricted', polygon: POLYGON });
    expect(ok).toBe(true);
    expect(store.count).toBe(before + 1);
    expect(store.lastCreatedId).toMatch(/zon-local-/);
    expect(store.zones[0].id).toBe(store.lastCreatedId);
  });

  it('validates before submitting', async () => {
    const store = makeStore();
    await store.load();
    const ok = await store.create({ name: '', type: 'restricted', polygon: POLYGON });
    expect(ok).toBe(false);
    expect(store.fieldErrors.name).toBeTruthy();
    expect(store.count).not.toBe(0);
  });

  it('clears errors', () => {
    const store = makeStore();
    store.fieldErrors = { name: 'x' };
    store.submitError = 'y';
    store.clearErrors();
    expect(store.fieldErrors).toEqual({});
    expect(store.submitError).toBe('');
  });

  it('handles live API errors', async () => {
    const store = makeStore('');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ detail: 'Сервіс недоступний' }),
    }));
    await store.load();
    expect(store.status).toBe('error');
    expect(store.error).toBe('Сервіс недоступний');
    vi.unstubAllGlobals();
  });
});
