import { ZONE_TYPES } from '../lib/zones.js';
import { polygonToString } from '../lib/zones.js';
import { StateMessage } from './StateMessage.jsx';

export function ZoneList({ status, zones, error, newId, onRetry }) {
  if (status === 'loading') {
    return <StateMessage kind="loading" title="Завантаження зон…" />;
  }
  if (status === 'error') {
    return <StateMessage kind="error" title="Не вдалося завантажити зони" message={error} onRetry={onRetry} />;
  }
  if (!zones.length) {
    return <StateMessage kind="empty" title="Зон ще немає" message="Створіть зону за допомогою форми вище." />;
  }
  return (
    <ul className="zone-list">
      {zones.map((zone) => {
        const meta = ZONE_TYPES[zone.type] || ZONE_TYPES.restricted;
        return (
          <li key={zone.id} className={`zone-card zone-card--${meta.color} ${zone.id === newId ? 'is-new' : ''}`}>
            <div className="zone-card__head">
              <span className="zone-card__code">{meta.code}</span>
              <div>
                <strong>{zone.name}</strong>
                <span className="zone-card__type">{meta.label}</span>
              </div>
              <span className={`zone-card__badge ${zone.active ? 'is-active' : ''}`}>
                {zone.active ? 'активна' : 'неактивна'}
              </span>
            </div>
            {zone.description && <p className="zone-card__desc">{zone.description}</p>}
            <p className="zone-card__polygon">{polygonToString(zone.polygon)}</p>
            <span className="zone-card__entry">
              {zone.alertOnEntry ? 'Сповіщення про вхід: увімкнено' : 'Сповіщення про вхід: вимкнено'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
