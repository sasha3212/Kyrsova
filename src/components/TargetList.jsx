import { TargetRow } from './TargetRow.jsx';
import { StateMessage } from './StateMessage.jsx';

export function TargetList({ status, targets, error, selectedId, onSelect, onRetry }) {
  if (status === 'loading') {
    return <StateMessage kind="loading" title="Опитування джерел…" message="Отримуємо повітряну та надводну обстановку." />;
  }
  if (status === 'error') {
    return <StateMessage kind="error" title="Канал даних недоступний" message={error} onRetry={onRetry} />;
  }
  if (status === 'empty' || targets.length === 0) {
    return <StateMessage kind="empty" title="Цілей не виявлено" message="Змініть фільтр або зачекайте на наступне опитування." />;
  }
  return (
    <ul className="target-list">
      {targets.map((target) => (
        <TargetRow
          key={target.id}
          target={target}
          selected={target.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
