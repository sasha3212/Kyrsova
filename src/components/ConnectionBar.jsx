const LABELS = {
  online: 'Канал активний',
  connecting: 'Підключення…',
  reconnecting: 'Перепідключення',
  offline: 'Канал відключений',
  error: 'Помилка каналу',
};

export function ConnectionBar({ status, attempt, count, updated }) {
  return (
    <div className={`connbar connbar--${status}`} role="status">
      <span className="connbar__pulse" aria-hidden="true" />
      <strong>{LABELS[status] || status}</strong>
      {attempt > 0 && <span className="connbar__muted">· спроба {attempt}</span>}
      <span className="connbar__spacer" />
      <span className="connbar__muted">Цілей: {count}</span>
      {updated && <span className="connbar__muted">· оновлено {updated}</span>}
    </div>
  );
}
