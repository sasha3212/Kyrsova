import { AFFILIATIONS, KINDS } from '../lib/targets.js';

export function Legend() {
  return (
    <section className="legend" aria-labelledby="legend-title">
      <h2 id="legend-title" className="section-title">Позначення</h2>
      <div className="legend__group">
        {Object.entries(AFFILIATIONS).map(([key, value]) => (
          <span key={key} className="legend__item">
            <i className={`legend__dot aff--${value.color}`} />{value.label}
          </span>
        ))}
      </div>
      <div className="legend__group">
        {Object.entries(KINDS).map(([key, value]) => (
          <span key={key} className="legend__item">
            <i className="legend__glyph">{value.glyph}</i>{value.label}
          </span>
        ))}
      </div>
    </section>
  );
}
