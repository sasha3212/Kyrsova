import { describe, expect, it } from 'vitest';
import {
  AFFILIATIONS,
  KINDS,
  altitudeLabel,
  compareTargets,
  decorateTarget,
  isAlerting,
  matchesFilter,
  normalizeTrack,
  targetAge,
  targetDomain,
  targetFreshness,
} from '../src/lib/targets.js';

const OP = { lat: 46.485, lon: 30.73 };

const RAW = {
  id: 'AIR-1',
  label: 'TEST-1',
  kind: 'aircraft',
  affiliation: 'suspect',
  source: 'radar',
  lat: 46.44,
  lon: 30.7,
  altitude: 3200,
  speed: 420,
  course: 370,
  confidence: 0.8,
  ts: Date.now() - 5000,
};

describe('targets', () => {
  it('exposes classification dictionaries', () => {
    expect(Object.keys(AFFILIATIONS)).toContain('hostile');
    expect(KINDS.uav.domain).toBe('air');
    expect(KINDS.ship.domain).toBe('surface');
  });

  it('normalizes tracks with defaults and guards', () => {
    const t = normalizeTrack({ lat: '46.44', lon: '30.7', course: -10, confidence: 5 });
    expect(t.kind).toBe('uav');
    expect(t.affiliation).toBe('unknown');
    expect(t.course).toBe(350);
    expect(t.confidence).toBe(1);
    expect(normalizeTrack({ lat: 'x', lon: 1 })).toBe(null);
    expect(normalizeTrack(null)).toBe(null);
  });

  it('detects domain, age and freshness', () => {
    const t = normalizeTrack(RAW);
    expect(targetDomain(t)).toBe('air');
    expect(targetAge(t, t.ts + 10_000)).toBe(10);
    expect(targetFreshness(t, t.ts + 10_000)).toBe('fresh');
    expect(targetFreshness(t, t.ts + 100_000)).toBe('stale');
    expect(targetFreshness(t, t.ts + 250_000)).toBe('lost');
  });

  it('formats altitude as flight level for air targets', () => {
    const air = normalizeTrack(RAW);
    expect(altitudeLabel(air)).toContain('FL105');
    const surface = normalizeTrack({ ...RAW, kind: 'ship', altitude: null });
    expect(altitudeLabel(surface)).toBe('—');
  });

  it('marks alerting affiliations', () => {
    expect(isAlerting({ affiliation: 'hostile' })).toBe(true);
    expect(isAlerting({ affiliation: 'suspect' })).toBe(true);
    expect(isAlerting({ affiliation: 'friendly' })).toBe(false);
  });

  it('decorates a target with bearing, distance and labels', () => {
    const t = normalizeTrack(RAW);
    const d = decorateTarget(t, OP, t.ts);
    expect(d.kindLabel).toBe('Літак');
    expect(d.affiliationLabel).toBe('Підозрілий');
    expect(d.sourceLabel).toBe('РЛС');
    expect(d.distanceNm).toBeGreaterThan(0);
    expect(d.cardinal).toBeTruthy();
    expect(d.courseLabel).toContain('010°');
    expect(d.alerting).toBe(true);
    expect(d.callsign).toBe('TEST-1');
  });

  it('sorts hostile targets first', () => {
    const hostile = decorateTarget(normalizeTrack({ ...RAW, affiliation: 'friendly', distanceNm: 1, lat: 46.48, lon: 30.735 }), OP);
    const friendly = decorateTarget(normalizeTrack({ ...RAW, affiliation: 'hostile', distanceNm: 5, lat: 46.44, lon: 30.7 }), OP);
    expect([hostile, friendly].sort(compareTargets)[0].affiliation).toBe('hostile');
  });

  it('matches filters', () => {
    const air = decorateTarget(normalizeTrack(RAW), OP);
    const surface = decorateTarget(normalizeTrack({ ...RAW, kind: 'ship' }), OP);
    expect(matchesFilter(air, 'all')).toBe(true);
    expect(matchesFilter(air, 'air')).toBe(true);
    expect(matchesFilter(air, 'surface')).toBe(false);
    expect(matchesFilter(surface, 'surface')).toBe(true);
    expect(matchesFilter(air, 'alerts')).toBe(true);
  });
});
