import { formatAge, formatClock } from '../lib/format.js';
import { formatLat, formatLon } from '../lib/geo.js';
import { Button } from './Button.jsx';

export function TargetDetails({ target, onClose }) {
  if (!target) return null;
  const rows = [
    ['Клас', `${target.kindLabel} · ${target.domain === 'air' ? 'повітряна' : 'надводна'}`],
    ['Належність', target.affiliationLabel],
    ['Координати', `${formatLat(target.lat)}  ${formatLon(target.lon)}`],
    ['Висота', target.altitudeLabel],
    ['Швидкість', target.speedLabel],
    ['Курс', target.courseLabel],
    ['Пеленг / дальність', `${target.bearing}° ${target.cardinal} · ${target.distanceLabel} NM`],
    ['Джерело', target.sourceLabel],
    ['Впевненість', `${Math.round(target.confidence * 100)}%`],
    ['Останнє оновлення', `${formatClock(target.ts, true)} · ${formatAge(target.ageSec)}`],
  ];
  return (
    <section className="details" aria-labelledby="details-title">
      <div className="section-head">
        <h2 id="details-title" className="section-title">Картка цілі · {target.callsign}</h2>
        <Button small variant="ghost" onClick={onClose}>Закрити</Button>
      </div>
      <dl className="details__grid">
        {rows.map(([label, value]) => (
          <div key={label} className="details__row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {target.alerting && (
        <p className="details__warning" role="status">Ціль потребує уваги оператора.</p>
      )}
    </section>
  );
}
