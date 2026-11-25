import { describe, expect, it } from 'vitest';
import { advanceTrack, simulateStep } from '../src/lib/simulation.js';
import { buildMockTracks, buildMockZonePayload } from '../src/data/mockTargets.js';

const TRACK = {
  id: 'T1', kind: 'aircraft', affiliation: 'friendly', source: 'radar',
  lat: 46.44, lon: 30.7, altitude: 1000, speed: 360,
  course: 90, confidence: 0.8, ts: 1000, label: 'T1',
};

describe('simulation', () => {
  it('moves a track east on course 090', () => {
    const next = advanceTrack(TRACK, 3600);
    expect(next.lon).toBeGreaterThan(TRACK.lon);
    expect(next.lat).toBeCloseTo(TRACK.lat, 2);
    expect(next.ts).toBe(1000 + 3_600_000);
  });

  it('moves a track north on course 000', () => {
    const next = advanceTrack({ ...TRACK, course: 0 }, 3600);
    expect(next.lat).toBeGreaterThan(TRACK.lat);
  });

  it('advances a list of tracks', () => {
    const list = simulateStep([TRACK, TRACK], 5);
    expect(list).toHaveLength(2);
    expect(list[0].lon).toBeGreaterThan(TRACK.lon);
  });
});

describe('mock data', () => {
  it('provides air and surface targets', () => {
    expect(buildMockTracks('normal').length).toBeGreaterThan(5);
    expect(buildMockTracks('air').every((t) => ['aircraft', 'helicopter', 'uav', 'missile'].includes(t.kind))).toBe(true);
    expect(buildMockTracks('surface').every((t) => ['ship', 'boat', 'submarine'].includes(t.kind))).toBe(true);
    expect(buildMockTracks('empty')).toEqual([]);
    expect(buildMockTracks('error')).toEqual([]);
  });

  it('provides zones', () => {
    expect(buildMockZonePayload().length).toBeGreaterThan(2);
  });
});
