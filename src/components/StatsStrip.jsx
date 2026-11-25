export function StatsStrip({ stats }) {
  const cells = [
    { label: 'Усього', value: stats.total, tone: 'total' },
    { label: 'Повітряні', value: stats.air, tone: 'air' },
    { label: 'Надводні', value: stats.surface, tone: 'surface' },
    { label: 'Тривожні', value: stats.alerting, tone: 'alert' },
  ];
  return (
    <div className="stats-strip" aria-label="Зведена статистика">
      {cells.map((cell) => (
        <div key={cell.tone} className={`stats-strip__cell stats-strip__cell--${cell.tone}`}>
          <span className="stats-strip__value">{cell.value}</span>
          <span className="stats-strip__label">{cell.label}</span>
        </div>
      ))}
    </div>
  );
}
