export function Button({
  children,
  variant = 'primary',
  small = false,
  active = false,
  busy = false,
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    small ? 'btn--small' : '',
    active ? 'btn--active' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      className={classes}
      aria-busy={busy || undefined}
      aria-pressed={active || undefined}
      {...props}
    >
      {children}
    </button>
  );
}
