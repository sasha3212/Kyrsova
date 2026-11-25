import { bearingDeg, cardinal, formatNm, haversineNm } from './geo.js';

export const AFFILIATIONS = {
  friendly: { label: 'Свій', short: 'F', color: 'friendly' },
  neutral: { label: 'Нейтральний', short: 'N', color: 'neutral' },
  suspect: { label: 'Підозрілий', short: 'S', color: 'suspect' },
  unknown: { label: 'Невідомий', short: 'U', color: 'unknown' },
  hostile: { label: 'Ворожий', short: 'H', color: 'hostile' },
};

export const KINDS = {
  aircraft: { label: 'Літак', domain: 'air', glyph: '✈' },
  helicopter: { label: 'Вертоліт', domain: 'air', glyph: '⚙' },
  uav: { label: 'БпЛА', domain: 'air', glyph: '◆' },
  missile: { label: 'Ракета', domain: 'air', glyph: '▲' },
  ship: { label: 'Корабель', domain: 'surface', glyph: '▬' },
  boat: { label: 'Катер', domain: 'surface', glyph: '◄' },
  submarine: { label: 'ПЧ', domain: 'surface', glyph: '▽' },
};

export const SOURCES = {
  radar: 'РЛС',
  adsb: 'ADS-B',
  ais: 'AIS',
  fusion: 'Фузія',
};

export const FILTERS = {
  all: 'Усі цілі',
  air: 'Повітряні',
  surface: 'Надводні',
  alerts: 'Тривоги',
};

export const STALE_AFTER_SEC = 90;
export const LOST_AFTER_SEC = 240;

const AFFILIATION_KEYS = Object.keys(AFFILIATIONS);
const KIND_KEYS = Object.keys(KINDS);
const SOURCE_KEYS = Object.keys(SOURCES);

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeTrack(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (!Number.isFinite(Number(raw.lat)) || !Number.isFinite(Number(raw.lon))) {
    return null;
  }
  const kind = KIND_KEYS.includes(raw.kind) ? raw.kind : 'uav';
  const affiliation = AFFILIATION_KEYS.includes(raw.affiliation)
    ? raw.affiliation
    : 'unknown';
  const source = SOURCE_KEYS.includes(raw.source) ? raw.source : 'radar';
  return {
    id: String(raw.id || `TRK-${Math.random().toString(36).slice(2, 8)}`),
    kind,
    affiliation,
    source,
    lat: Number(raw.lat),
    lon: Number(raw.lon),
    altitude: raw.altitude == null ? null : num(raw.altitude, 0),
    speed: Math.max(0, num(raw.speed, 0)),
    course: ((num(raw.course, 0) % 360) + 360) % 360,
    confidence: Math.min(1, Math.max(0, num(raw.confidence, 0.6))),
    ts: num(raw.ts, Date.now()),
    label: raw.label ? String(raw.label) : '',
  };
}

export function targetDomain(target) {
  return KINDS[target.kind]?.domain || 'air';
}

export function targetAge(target, now = Date.now()) {
  return Math.max(0, Math.floor((now - target.ts) / 1000));
}

export function targetFreshness(target, now = Date.now()) {
  const age = targetAge(target, now);
  if (age >= LOST_AFTER_SEC) return 'lost';
  if (age >= STALE_AFTER_SEC) return 'stale';
  return 'fresh';
}

export function isAlerting(target) {
  return (
    target.affiliation === 'hostile' ||
    target.affiliation === 'suspect' ||
    target.affiliation === 'unknown'
  );
}

export function altitudeLabel(target) {
  if (!targetDomainIsAir(target)) return '—';
  if (target.altitude == null) return 'н/в';
  const flightLevel = Math.round(target.altitude / 30.48);
  return `${Math.round(target.altitude)} м · FL${String(flightLevel).padStart(3, '0')}`;
}

function targetDomainIsAir(target) {
  return targetDomain(target) === 'air';
}

export function decorateTarget(target, origin, now = Date.now()) {
  const distanceNm = haversineNm(origin, target);
  const bearing = bearingDeg(origin, target);
  const freshness = targetFreshness(target, now);
  const affiliation = AFFILIATIONS[target.affiliation] || AFFILIATIONS.unknown;
  const kind = KINDS[target.kind] || KINDS.uav;
  return {
    ...target,
    domain: kind.domain,
    kindLabel: kind.label,
    glyph: kind.glyph,
    affiliationLabel: affiliation.label,
    affiliationColor: affiliation.color,
    sourceLabel: SOURCES[target.source] || target.source,
    distanceNm,
    distanceLabel: formatNm(distanceNm),
    bearing: Math.round(bearing),
    cardinal: cardinal(bearing),
    ageSec: targetAge(target, now),
    freshness,
    altitudeLabel: altitudeLabel(target),
    speedLabel: `${Math.round(target.speed)} шт`,
    courseLabel: `${String(Math.round(target.course)).padStart(3, '0')}° ${cardinal(target.course)}`,
    alerting: isAlerting(target),
    callsign: target.label || target.id,
  };
}

export function compareTargets(a, b) {
  const affinity = {
    hostile: 0,
    suspect: 1,
    unknown: 2,
    neutral: 3,
    friendly: 4,
  };
  const delta = (affinity[a.affiliation] ?? 5) - (affinity[b.affiliation] ?? 5);
  if (delta !== 0) return delta;
  return a.distanceNm - b.distanceNm;
}

export function matchesFilter(target, filter) {
  if (filter === 'all') return true;
  if (filter === 'air') return targetDomain(target) === 'air';
  if (filter === 'surface') return targetDomain(target) === 'surface';
  if (filter === 'alerts') return target.alerting;
  return true;
}
