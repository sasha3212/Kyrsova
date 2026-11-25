import { TargetDetails } from '../components/TargetDetails.jsx';
import { decorateTarget, normalizeTrack } from '../lib/targets.js';
import { Frame } from './Frame.jsx';

export default {
  title: 'Situation/TargetDetails',
  component: TargetDetails,
};

const TARGET = decorateTarget(normalizeTrack({
  id: 'AIR-1', label: 'SKY-1', kind: 'aircraft', affiliation: 'suspect',
  source: 'adsb', lat: 46.44, lon: 30.7, altitude: 3200,
  speed: 420, course: 95, confidence: 0.86, ts: Date.now() - 4000,
}), { lat: 46.485, lon: 30.73 });

export const Default = () => (
  <Frame title="TargetDetails">
    <TargetDetails target={TARGET} onClose={() => {}} />
  </Frame>
);

export const Surface = () => (
  <Frame title="TargetDetails · надводна ціль">
    <TargetDetails
      target={decorateTarget(normalizeTrack({
        id: 'SHIP-1', label: 'BULK-7', kind: 'ship', affiliation: 'neutral',
        source: 'ais', lat: 46.4, lon: 30.66, altitude: null,
        speed: 14, course: 75, confidence: 0.95, ts: Date.now() - 9000,
      }), { lat: 46.485, lon: 30.73 })}
      onClose={() => {}}
    />
  </Frame>
);
