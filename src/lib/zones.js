import { pointInPolygon } from './geo.js';

export const ZONE_TYPES = {
  restricted: { label: 'Заборонена зона', color: 'critical', code: 'R' },
  airspace: { label: 'Повітряний простір', color: 'warning', code: 'A' },
  lane: { label: 'Морський коридор', color: 'info', code: 'L' },
  security: { label: 'Зона безпеки', color: 'accent', code: 'S' },
};

export const ZONE_TYPE_KEYS = Object.keys(ZONE_TYPES);

export function parsePolygon(text) {
  if (typeof text !== 'string' || !text.trim()) return [];
  return text
    .split(/[;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
      if (!match) return null;
      const lon = Number(match[1]);
      const lat = Number(match[2]);
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
      if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null;
      return [lon, lat];
    });
}

export function polygonToString(polygon) {
  if (!Array.isArray(polygon)) return '';
  return polygon.map(([lon, lat]) => `${lon}, ${lat}`).join('; ');
}

export function validateZoneInput(input) {
  const errors = {};
  const name = typeof input?.name === 'string' ? input.name.trim() : '';
  const type = ZONE_TYPE_KEYS.includes(input?.type) ? input.type : 'restricted';
  const polygon = input && Array.isArray(input.polygon)
    ? input.polygon
    : parsePolygon(input?.polygonText);
  const alertOnEntry = input?.alertOnEntry !== false;

  if (!name) errors.name = 'Вкажіть назву зони.';
  else if (name.length < 3) errors.name = 'Назва має містити щонайменше 3 символи.';
  if (!ZONE_TYPE_KEYS.includes(input?.type)) errors.type = 'Оберіть тип зони.';
  if (polygon.length < 3) errors.polygon = 'Полігон має містити щонайменше 3 точки.';
  if (polygon.some((point) => point === null)) {
    errors.polygon = 'Невірний формат точки. Використовуйте «довгота, широта».';
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { name, type, polygon, alertOnEntry },
  };
}

export function normalizeZone(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const polygon = Array.isArray(raw.polygon)
    ? raw.polygon.filter((p) => Array.isArray(p) && p.length === 2)
    : parsePolygon(raw.polygonText);
  if (polygon.length < 3) return null;
  return {
    id: String(raw.id || `zon-${Math.random().toString(36).slice(2, 8)}`),
    name: String(raw.name || 'Без назви'),
    type: ZONE_TYPE_KEYS.includes(raw.type) ? raw.type : 'restricted',
    polygon,
    alertOnEntry: raw.alertOnEntry !== false,
    active: raw.active !== false,
    description: raw.description ? String(raw.description) : '',
  };
}

export function zoneContains(zone, point) {
  if (!zone.active) return false;
  return pointInPolygon(point, zone.polygon);
}

export function zonesForPoint(zones, point) {
  return zones.filter((zone) => zoneContains(zone, point));
}

export function detectZoneEvents(targets, zones, previousInside) {
  const events = [];
  const nextInside = new Set();
  for (const target of targets) {
    for (const zone of zonesForPoint(zones, target)) {
      const key = `${target.id}:${zone.id}`;
      nextInside.add(key);
      if (!previousInside.has(key) && zone.alertOnEntry) {
        events.push({
          id: `${key}:${target.ts}`,
          targetId: target.id,
          targetLabel: target.label || target.id,
          zoneId: zone.id,
          zoneName: zone.name,
          affiliation: target.affiliation,
          severity: zone.type === 'restricted' ? 'critical' : 'warning',
          ts: Date.now(),
          domain: target.domain,
        });
      }
    }
  }
  return { events, nextInside };
}

export function zoneCentroid(zone) {
  if (!zone?.polygon?.length) return null;
  const sums = zone.polygon.reduce(
    (acc, [lon, lat]) => ({ lon: acc.lon + lon, lat: acc.lat + lat }),
    { lon: 0, lat: 0 },
  );
  return {
    lon: sums.lon / zone.polygon.length,
    lat: sums.lat / zone.polygon.length,
  };
}
