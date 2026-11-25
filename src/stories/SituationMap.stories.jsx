import { SituationMap } from '../components/SituationMap.jsx';
import { OBSERVATION_POST } from '../data/area.js';
import { decorateTarget, normalizeTrack } from '../lib/targets.js';
import { normalizeZone } from '../lib/zones.js';
import { Frame } from './Frame.jsx';

export default {
  title: 'Situation/SituationMap',
  component: SituationMap,
};

const OP = { lat: OBSERVATION_POST.lat, lon: OBSERVATION_POST.lon };

function target(id, kind, affiliation, lat, lon, course = 90) {
  return decorateTarget(normalizeTrack({
    id, label: id, kind, affiliation, source: 'radar',
    lat, lon, altitude: kind === 'ship' ? null : 1200,
    speed: 300, course, confidence: 0.8, ts: Date.now() - 3000,
  }), OP);
}

const TARGETS = [
  target('AIR-1', 'aircraft', 'friendly', 46.44, 30.62),
  target('UAV-2', 'uav', 'unknown', 46.42, 30.7),
  target('MIS-3', 'missile', 'hostile', 46.37, 30.88),
  target('SHIP-4', 'ship', 'neutral', 46.4, 30.66),
];

const ZONES = [
  normalizeZone({
    id: 'Z1', name: 'Заборонена зона Альфа', type: 'restricted',
    polygon: [[30.74, 46.47], [30.82, 46.47], [30.82, 46.4], [30.74, 46.4]],
  }),
];

export const Default = () => (
  <Frame title="SituationMap">
    <SituationMap targets={TARGETS} zones={ZONES} selectedId="UAV-2" />
  </Frame>
);

export const Empty = () => (
  <Frame title="SituationMap · порожньо">
    <SituationMap targets={[]} zones={[]} />
  </Frame>
);
