import { describe, expect, it } from 'vitest';
import {
  bearingDeg,
  bboxFromCenter,
  cardinal,
  clamp,
  formatLat,
  formatLon,
  formatNm,
  haversineNm,
  inBbox,
  pointInPolygon,
  project,
  projectCourseVector,
} from '../src/lib/geo.js';

const OP = { lat: 46.485, lon: 30.73 };

describe('geo', () => {
  it('converts and clamps', () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it('computes distance in nautical miles', () => {
    expect(haversineNm(OP, OP)).toBeCloseTo(0, 6);
    const north = { lat: 46.495, lon: 30.73 };
    expect(haversineNm(OP, north)).toBeCloseTo(0.6, 1);
  });

  it('computes bearing and cardinal point', () => {
    expect(bearingDeg(OP, { lat: 46.5, lon: 30.73 })).toBeCloseTo(0, 0);
    expect(bearingDeg(OP, { lat: 46.485, lon: 30.75 })).toBeCloseTo(90, 0);
    expect(cardinal(0)).toBe('Пн');
    expect(cardinal(90)).toBe('Сх');
    expect(cardinal(180)).toBe('Пд');
    expect(cardinal(270)).toBe('Зх');
    expect(cardinal(-90)).toBe('Зх');
  });

  it('tests bounding box', () => {
    const bbox = bboxFromCenter(OP, 0.3, 0.15);
    expect(inBbox(OP, bbox)).toBe(true);
    expect(inBbox({ lat: 47, lon: 31 }, bbox)).toBe(false);
  });

  it('tests point in polygon (ray casting)', () => {
    const square = [[0, 0], [2, 0], [2, 2], [0, 2]];
    expect(pointInPolygon({ lon: 1, lat: 1 }, square)).toBe(true);
    expect(pointInPolygon({ lon: 3, lat: 1 }, square)).toBe(false);
    expect(pointInPolygon({ lon: 1, lat: 1 }, [[0, 0], [1, 1]])).toBe(false);
  });

  it('projects coordinates into a viewport', () => {
    const viewport = { bbox: { west: 30, east: 31, south: 46, north: 47 }, width: 100, height: 100 };
    expect(project({ lon: 30, lat: 47 }, viewport)).toEqual({ x: 0, y: 0 });
    expect(project({ lon: 31, lat: 46 }, viewport)).toEqual({ x: 100, y: 100 });
    expect(project({ lon: 30.5, lat: 46.5 }, viewport)).toEqual({ x: 50, y: 50 });
  });

  it('builds a course vector', () => {
    const viewport = { bbox: { west: 30, east: 31, south: 46, north: 47 }, width: 100, height: 100 };
    const vector = projectCourseVector({ lon: 30.5, lat: 46.5 }, 0, 10, viewport);
    expect(vector.x1).toBeCloseTo(50, 5);
    expect(vector.y1).toBeCloseTo(50, 5);
    expect(vector.y2).toBeLessThan(vector.y1);
  });

  it('formats coordinates and numbers', () => {
    expect(formatLat(46.485)).toBe('46.4850° N');
    expect(formatLon(-30.5)).toBe('30.5000° W');
    expect(formatLat(undefined)).toBe('—');
    expect(formatNm(2.456)).toBe('2.46');
    expect(formatNm(12.3)).toBe('12.3');
  });
});
