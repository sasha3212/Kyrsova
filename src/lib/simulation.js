import { toRadians } from './geo.js';

const NM_PER_DEG_LAT = 60.0405;

export function advanceTrack(track, seconds) {
  const hours = seconds / 3600;
  const distanceNm = track.speed * hours;
  const rad = toRadians(track.course);
  const dLat = (Math.cos(rad) * distanceNm) / NM_PER_DEG_LAT;
  const lonScale = Math.cos(toRadians(track.lat)) || 1;
  const dLon = (Math.sin(rad) * distanceNm) / (NM_PER_DEG_LAT * lonScale);
  return {
    ...track,
    lat: track.lat + dLat,
    lon: track.lon + dLon,
    ts: track.ts + seconds * 1000,
  };
}

export function simulateStep(tracks, seconds = 5) {
  return tracks.map((track) => advanceTrack(track, seconds));
}
