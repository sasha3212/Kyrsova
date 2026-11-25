import { OBSERVATION_POST } from './area.js';

const now = () => Date.now();

export function buildMockTracks(mode = 'normal') {
  const base = now();
  const tracks = [
    {
      id: 'AIR-201', label: 'SKY-201', kind: 'aircraft', affiliation: 'friendly',
      source: 'adsb', lat: 46.44, lon: 30.62, altitude: 3200, speed: 420,
      course: 95, confidence: 0.98, ts: base - 4_000,
    },
    {
      id: 'AIR-217', label: 'RCH-17', kind: 'aircraft', affiliation: 'suspect',
      source: 'radar', lat: 46.4, lon: 30.78, altitude: 1500, speed: 360,
      course: 280, confidence: 0.84, ts: base - 9_000,
    },
    {
      id: 'UAV-042', label: 'UAV-042', kind: 'uav', affiliation: 'unknown',
      source: 'radar', lat: 46.42, lon: 30.7, altitude: 600, speed: 110,
      course: 120, confidence: 0.61, ts: base - 16_000,
    },
    {
      id: 'HEL-008', label: 'MED-08', kind: 'helicopter', affiliation: 'neutral',
      source: 'fusion', lat: 46.36, lon: 30.86, altitude: 300, speed: 140,
      course: 60, confidence: 0.79, ts: base - 22_000,
    },
    {
      id: 'MIS-001', label: '???', kind: 'missile', affiliation: 'hostile',
      source: 'radar', lat: 46.37, lon: 30.88, altitude: 80, speed: 780,
      course: 300, confidence: 0.55, ts: base - 3_000,
    },
    {
      id: 'AIR-155', label: 'CFC-155', kind: 'aircraft', affiliation: 'friendly',
      source: 'adsb', lat: 46.5, lon: 30.55, altitude: 5000, speed: 480,
      course: 170, confidence: 0.99, ts: base - 6_000,
    },
    {
      id: 'SHIP-771', label: 'BULK-7', kind: 'ship', affiliation: 'neutral',
      source: 'ais', lat: 46.4, lon: 30.66, altitude: null, speed: 14,
      course: 75, confidence: 0.95, ts: base - 30_000,
    },
    {
      id: 'BOAT-012', label: 'COAST-12', kind: 'boat', affiliation: 'friendly',
      source: 'ais', lat: 46.44, lon: 30.74, altitude: null, speed: 22,
      course: 200, confidence: 0.93, ts: base - 12_000,
    },
    {
      id: 'SHIP-330', label: 'TANKER-3', kind: 'ship', affiliation: 'suspect',
      source: 'fusion', lat: 46.38, lon: 30.82, altitude: null, speed: 11,
      course: 290, confidence: 0.72, ts: base - 140_000,
    },
    {
      id: 'SUB-009', label: 'SUB-09', kind: 'submarine', affiliation: 'hostile',
      source: 'radar', lat: 46.36, lon: 30.87, altitude: null, speed: 8,
      course: 100, confidence: 0.48, ts: base - 250_000,
    },
    {
      id: 'BOAT-088', label: 'UNKNOWN-88', kind: 'boat', affiliation: 'unknown',
      source: 'radar', lat: 46.46, lon: 30.6, altitude: null, speed: 19,
      course: 35, confidence: 0.42, ts: base - 100_000,
    },
  ];

  if (mode === 'air') return tracks.filter((t) => t.kind in { aircraft: 1, helicopter: 1, uav: 1, missile: 1 });
  if (mode === 'surface') return tracks.filter((t) => !(t.kind in { aircraft: 1, helicopter: 1, uav: 1, missile: 1 }));
  if (mode === 'empty' || mode === 'error') return [];
  return tracks;
}

export function buildMockZonePayload() {
  return [
    {
      id: 'Z-ALFA', name: 'Заборонена зона «Альфа»', type: 'restricted',
      polygon: [[30.74, 46.47], [30.82, 46.47], [30.82, 46.4], [30.74, 46.4]],
      alertOnEntry: true, description: 'Польоти заборонені без дозволу.',
    },
    {
      id: 'Z-BETA', name: 'Повітряний коридор «Бета»', type: 'airspace',
      polygon: [[30.58, 46.5], [30.68, 46.5], [30.68, 46.42], [30.58, 46.42]],
      alertOnEntry: true, description: 'Військовий повітряний коридор.',
    },
    {
      id: 'Z-GAMMA', name: 'Морський коридор «Гамма»', type: 'lane',
      polygon: [[30.64, 46.44], [30.78, 46.4], [30.8, 46.37], [30.66, 46.41]],
      alertOnEntry: false, description: 'Рекомендований шлях суден.',
    },
    {
      id: 'Z-DELTA', name: 'Зона безпеки порту', type: 'security',
      polygon: [[30.7, 46.52], [30.76, 46.49], [30.74, 46.46], [30.69, 46.49]],
      alertOnEntry: true, description: 'Обмежений доступ.',
    },
  ];
}

export { OBSERVATION_POST };
