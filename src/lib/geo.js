export const NM_PER_DEG_LAT = 60.0405;
export const EARTH_RADIUS_NM = NM_PER_DEG_LAT * (180 / Math.PI);

export function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

export function toDegrees(rad) {
  return (rad * 180) / Math.PI;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function haversineNm(a, b) {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const dLat = lat2 - lat1;
  const dLon = toRadians(b.lon - a.lon);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  const angle = 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  return angle * EARTH_RADIUS_NM;
}

export function bearingDeg(a, b) {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const dLon = toRadians(b.lon - a.lon);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

const COMPASS = [
  'Пн', 'Пн-Сх-Сх', 'Пн-Сх', 'Сх-Пн-Сх', 'Сх', 'Сх-Пд-Сх', 'Пд-Сх',
  'Пд-Пд-Сх', 'Пд', 'Пд-Пд-Зх', 'Пд-Зх', 'Зх-Пд-Зх', 'Зх', 'Зх-Пн-Зх',
  'Пн-Зх', 'Пн-Пн-Зх',
];

export function cardinal(deg) {
  const value = ((deg % 360) + 360) % 360;
  const index = Math.round(value / 22.5) % 16;
  return COMPASS[index];
}

export function inBbox(point, bbox) {
  return (
    point.lat >= bbox.south &&
    point.lat <= bbox.north &&
    point.lon >= bbox.west &&
    point.lon <= bbox.east
  );
}

export function bboxFromCenter(center, halfWidthLon, halfHeightLat) {
  return {
    north: clamp(center.lat + halfHeightLat, -90, 90),
    south: clamp(center.lat - halfHeightLat, -90, 90),
    west: center.lon - halfWidthLon,
    east: center.lon + halfWidthLon,
  };
}

export function pointInPolygon(point, polygon) {
  if (!Array.isArray(polygon) || polygon.length < 3) return false;
  const x = point.lon;
  const y = point.lat;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function project(point, viewport) {
  const { bbox, width, height } = viewport;
  const spanLon = bbox.east - bbox.west || 1;
  const spanLat = bbox.north - bbox.south || 1;
  return {
    x: ((point.lon - bbox.west) / spanLon) * width,
    y: ((bbox.north - point.lat) / spanLat) * height,
  };
}

export function projectCourseVector(point, courseDeg, lengthPx, viewport) {
  const origin = project(point, viewport);
  const rad = toRadians(courseDeg);
  return {
    x1: origin.x,
    y1: origin.y,
    x2: origin.x + Math.sin(rad) * lengthPx,
    y2: origin.y - Math.cos(rad) * lengthPx,
  };
}

export function formatLat(lat) {
  if (typeof lat !== 'number' || Number.isNaN(lat)) return '—';
  const hemi = lat >= 0 ? 'N' : 'S';
  return `${Math.abs(lat).toFixed(4)}° ${hemi}`;
}

export function formatLon(lon) {
  if (typeof lon !== 'number' || Number.isNaN(lon)) return '—';
  const hemi = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lon).toFixed(4)}° ${hemi}`;
}

export function formatNm(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return value < 10 ? value.toFixed(2) : value.toFixed(1);
}
