export function TargetRow({ target, selected, onSelect }) {
  return (
    <li>
      <button
        type="button"
        className={`target-row aff--${target.affiliationColor} ${selected ? 'is-selected' : ''} fresh--${target.freshness}`}
        aria-pressed={selected}
        onClick={() => onSelect(target.id)}
      >
        <span className="target-row__glyph" aria-hidden="true">{target.glyph}</span>
        <span className="target-row__main">
          <strong className="target-row__id">{target.callsign}</strong>
          <span className="target-row__kind">{target.kindLabel} · {target.affiliationLabel}</span>
        </span>
        <span className="target-row__metrics">
          <span><b>{target.distanceLabel}</b> NM</span>
          <span>{target.bearing}° {target.cardinal}</span>
        </span>
        <span className="target-row__alt">{target.altitudeLabel}</span>
        {target.freshness !== 'fresh' && (
          <span className={`target-row__flag flag--${target.freshness}`}>
            {target.freshness === 'stale' ? 'застаріло' : 'втрачено'}
          </span>
        )}
      </button>
    </li>
  );
}
