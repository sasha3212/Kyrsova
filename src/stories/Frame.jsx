import '../styles/tokens.css';
import '../styles/styles.css';

export function Frame({ title, children }) {
  return (
    <div style={{ background: 'var(--bg-0)', color: 'var(--text)', padding: 18, minHeight: '100vh' }}>
      {title && <h2 style={{ marginTop: 0, fontSize: 15, letterSpacing: '.05em' }}>{title}</h2>}
      {children}
    </div>
  );
}
