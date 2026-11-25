import { formatClock } from '../lib/format.js';

export function AlertList({ alerts = [], onClear }) {
  return (
    <section className="alerts" aria-labelledby="alerts-title">
      <div className="section-head">
        <h2 id="alerts-title" className="section-title">Журнал тривог</h2>
        {alerts.length > 0 && (
          <button type="button" className="link-btn" onClick={onClear}>Очистити</button>
        )}
      </div>
      {alerts.length === 0 ? (
        <p className="alerts__empty">Нових подій немає.</p>
      ) : (
        <ul className="alerts__list">
          {alerts.map((alert) => (
            <li key={alert.id} className={`alert alert--${alert.severity}`}>
              <span className="alert__glyph" aria-hidden="true">▲</span>
              <div className="alert__body">
                <strong>{alert.targetLabel}</strong> у зоні «{alert.zoneName}»
                <span className="alert__meta">
                  {formatClock(alert.ts, true)} · {alert.domain === 'air' ? 'повітряна' : 'надводна'} ціль
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
