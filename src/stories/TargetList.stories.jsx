import { TargetList } from '../components/TargetList.jsx';
import { decorateTarget, normalizeTrack } from '../lib/targets.js';
import { Frame } from './Frame.jsx';

export default {
  title: 'Situation/TargetList',
  component: TargetList,
};

const OP = { lat: 46.485, lon: 30.73 };

function t(id, affiliation, kind, ageSec = 3) {
  return decorateTarget(normalizeTrack({
    id, label: id, kind, affiliation, source: 'radar',
    lat: 46.44, lon: 30.7, altitude: 1000, speed: 300,
    course: 90, confidence: 0.8, ts: Date.now() - ageSec * 1000,
  }), OP);
}

const TARGETS = [
  t('MIS-3', 'hostile', 'missile'),
  t('UAV-2', 'unknown', 'uav', 120),
  t('AIR-1', 'friendly', 'aircraft'),
];

export const Ready = () => (
  <Frame title="TargetList">
    <div className="contacts" style={{ marginTop: 0 }}>
      <TargetList status="ready" targets={TARGETS} selectedId="UAV-2" />
    </div>
  </Frame>
);

export const States = () => (
  <Frame title="TargetList states">
    <div style={{ display: 'grid', gap: 12, maxWidth: 460 }}>
      <TargetList status="loading" targets={[]} />
      <TargetList status="empty" targets={[]} />
      <TargetList status="error" targets={[]} error="Канал недоступний" onRetry={() => {}} />
    </div>
  </Frame>
);
