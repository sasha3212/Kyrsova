import { describe, expect, it } from 'vitest';
import {
  ZONE_TYPES,
  detectZoneEvents,
  normalizeZone,
  parsePolygon,
  polygonToString,
  validateZoneInput,
  zoneCentroid,
  zoneContains,
  zonesForPoint,
} from '../src/lib/zones.js';

const POLYGON = [[30.74, 46.47], [30.82, 46.47], [30.82, 46.4], [30.74, 46.4]];

describe('zones', () => {
  it('exposes zone types', () => {
    expect(ZONE_TYPES.restricted.color).toBe('critical');
    expect(ZONE_TYPES.lane.code).toBe('L');
  });

  it('parses and serializes polygons', () => {
    const parsed = parsePolygon('30.74, 46.47; 30.82, 46.47; 30.82, 46.4');
    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toEqual([30.74, 46.47]);
    expect(parsePolygon('')).toEqual([]);
    expect(parsePolygon('abc')).toEqual([null]);
    expect(parsePolygon('200, 10; 1, 2')).toEqual([null, [1, 2]]);
    expect(polygonToString(POLYGON)).toContain('30.74, 46.47');
  });

  it('validates input', () => {
    expect(validateZoneInput({ name: '', type: 'restricted', polygonText: '' }).ok).toBe(false);
    const ok = validateZoneInput({ name: 'Зона Альфа', type: 'airspace', polygon: POLYGON });
    expect(ok.ok).toBe(true);
    expect(ok.value.alertOnEntry).toBe(true);
    expect(validateZoneInput({ name: 'A', type: 'bogus', polygon: POLYGON }).errors.type).toBeTruthy();
  });

  it('normalizes zones and rejects tiny polygons', () => {
    const zone = normalizeZone({ id: 'Z1', name: 'A', polygon: POLYGON });
    expect(zone.type).toBe('restricted');
    expect(zone.active).toBe(true);
    expect(normalizeZone({ polygon: [[1, 2]] })).toBe(null);
    expect(normalizeZone(null)).toBe(null);
  });

  it('tests containment and centroid', () => {
    const zone = normalizeZone({ id: 'Z1', name: 'A', polygon: POLYGON });
    expect(zoneContains(zone, { lon: 30.78, lat: 46.43 })).toBe(true);
    expect(zoneContains(zone, { lon: 30.5, lat: 46.43 })).toBe(false);
    expect(zonesForPoint([zone], { lon: 30.78, lat: 46.43 })).toHaveLength(1);
    const c = zoneCentroid(zone);
    expect(c.lon).toBeCloseTo(30.78, 5);
    expect(c.lat).toBeCloseTo(46.435, 5);
    expect(zoneContains({ ...zone, active: false }, { lon: 30.78, lat: 46.43 })).toBe(false);
  });

  it('detects zone entry events once', () => {
    const zone = normalizeZone({ id: 'Z1', name: 'Альфа', polygon: POLYGON, alertOnEntry: true });
    const target = {
      id: 'T1', label: 'T1', ts: 1000, affiliation: 'suspect', domain: 'air',
      lon: 30.78, lat: 46.43,
    };
    const first = detectZoneEvents([target], [zone], new Set());
    expect(first.events).toHaveLength(1);
    expect(first.nextInside.has('T1:Z1')).toBe(true);
    const second = detectZoneEvents([target], [zone], first.nextInside);
    expect(second.events).toHaveLength(0);
  });
});
