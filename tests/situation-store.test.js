import { afterEach, describe, expect, it, vi } from 'vitest';
import { SituationStore } from '../src/stores/SituationStore.js';
import { normalizeZone } from '../src/lib/zones.js';

function makeStore(search = '?mock=normal', zones = []) {
  return new SituationStore({ search, zonesProvider: () => zones });
}

afterEach(() => {
  vi.useRealTimers();
});

describe('SituationStore', () => {
  it('detects the mock mode from the query string', () => {
    expect(makeStore('?mock=air').mode).toBe('air');
    expect(makeStore('').mode).toBe(null);
  });

  it('loads mock tracks', async () => {
    const store = makeStore();
    await store.load();
    expect(store.status).toBe('ready');
    expect(store.count).toBeGreaterThan(5);
    expect(store.items.length).toBe(store.count);
  });

  it('handles empty and error modes', async () => {
    const empty = makeStore('?mock=empty');
    await empty.load();
    expect(empty.status).toBe('empty');
    const error = makeStore('?mock=error');
    await error.load();
    expect(error.status).toBe('error');
    expect(error.error).toMatch('Демонстраційна');
  });

  it('merges tracks by id and ignores older updates', () => {
    const store = makeStore('?mock=empty');
    store.mergeTrack({ id: 'T1', lat: 46.4, lon: 30.7, ts: 2000 });
    store.mergeTrack({ id: 'T1', lat: 46.5, lon: 30.8, ts: 3000 });
    store.mergeTrack({ id: 'T1', lat: 46.6, lon: 30.9, ts: 1000 });
    expect(store.count).toBe(1);
    expect(store.tracks.get('T1').lat).toBe(46.5);
  });

  it('toggles selection and changes filter', async () => {
    const store = makeStore();
    await store.load();
    store.select('AIR-201');
    expect(store.selectedId).toBe('AIR-201');
    expect(store.selected?.id).toBe('AIR-201');
    store.select('AIR-201');
    expect(store.selectedId).toBe(null);
    store.clearSelection();
    store.setFilter('air');
    expect(store.filter).toBe('air');
    expect(store.listItems.every((t) => t.domain === 'air')).toBe(true);
  });

  it('computes stats by domain and affiliation', async () => {
    const store = makeStore();
    await store.load();
    expect(store.stats.total).toBe(store.count);
    expect(store.stats.air + store.stats.surface).toBe(store.count);
    expect(store.stats.alerting).toBeGreaterThan(0);
  });

  it('collects zone entry alerts', async () => {
    const zone = normalizeZone({
      id: 'Z1', name: 'Альфа', type: 'restricted',
      polygon: [[30.74, 46.47], [30.82, 46.47], [30.82, 46.4], [30.74, 46.4]],
      alertOnEntry: true,
    });
    const store = makeStore('?mock=normal', [zone]);
    await store.load();
    store.syncWithZones();
    expect(store.alerts.length).toBeGreaterThan(0);
    expect(store.alerts[0].zoneName).toBe('Альфа');
    store.clearAlerts();
    expect(store.alerts.length).toBe(0);
  });

  it('advances tracks on simulate', async () => {
    vi.useFakeTimers();
    const store = makeStore();
    await store.load();
    const before = store.tracks.get('AIR-201').lon;
    store.simulate();
    expect(store.tracks.get('AIR-201').lon).toBeGreaterThan(before);
  });

  it('starts and stops the mock stream', async () => {
    vi.useFakeTimers();
    const store = makeStore();
    await store.start();
    expect(store.connectionStatus).toBe('online');
    const before = store.tracks.get('AIR-201').lon;
    vi.advanceTimersByTime(5000);
    expect(store.tracks.get('AIR-201').lon).toBeGreaterThan(before);
    store.stop();
  });
});
