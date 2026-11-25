import { ZoneForm } from '../components/ZoneForm.jsx';
import { ZoneList } from '../components/ZoneList.jsx';
import { buildMockZonePayload } from '../data/mockTargets.js';
import { normalizeZone } from '../lib/zones.js';
import { Frame } from './Frame.jsx';

export default {
  title: 'Zones/Forms & Lists',
};

const ZONES = buildMockZonePayload().map(normalizeZone);

export const Form = () => (
  <Frame title="ZoneForm">
    <ZoneForm onSubmit={() => {}} submitting={false} fieldErrors={{}} submitError="" />
  </Frame>
);

export const FormWithErrors = () => (
  <Frame title="ZoneForm · помилки валідації">
    <ZoneForm
      onSubmit={() => {}}
      submitting={false}
      fieldErrors={{ name: 'Вкажіть назву зони.', polygon: 'Полігон має містити щонайменше 3 точки.' }}
      submitError="Сервер недоступний"
    />
  </Frame>
);

export const List = () => (
  <Frame title="ZoneList">
    <ZoneList status="ready" zones={ZONES} newId={ZONES[0].id} />
  </Frame>
);

export const Empty = () => (
  <Frame title="ZoneList · порожньо">
    <ZoneList status="empty" zones={[]} />
  </Frame>
);
