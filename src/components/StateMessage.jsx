export function StateMessage({ kind = 'empty', title, message, onRetry }) {
  const glyph = kind === 'error' ? '!' : kind === 'loading' ? '◌' : '∅';
  return (
    <div className={`state-msg state-msg--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <span className="state-msg__glyph" aria-hidden="true">{glyph}</span>
      <div>
        <p className="state-msg__title">{title}</p>
        {message && <p className="state-msg__text">{message}</p>}
      </div>
      {onRetry && (
        <button type="button" className="btn btn--ghost btn--small" onClick={onRetry}>
          Повторити
        </button>
      )}
    </div>
  );
}
