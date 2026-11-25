import { formatClock } from '../lib/format.js';

export function Header({ clock, status, areaName }) {
  const online = status === 'online';
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__mark" aria-hidden="true">◎</span>
        <span className="brand__name">ARGUS</span>
        <span className="brand__sub">підсистема відображення обстановки</span>
      </div>
      <div className="topbar__right">
        <span className="area-chip" title={areaName}>{areaName}</span>
        <span className={`status-dot ${online ? 'is-online' : 'is-offline'}`} aria-hidden="true" />
        <time className="clock" dateTime={new Date(clock).toISOString()}>
          {formatClock(clock, true)}
        </time>
      </div>
    </header>
  );
}
