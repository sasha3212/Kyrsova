import { FILTERS } from '../lib/targets.js';
import { Button } from './Button.jsx';

export function FilterBar({ value, onChange, stats }) {
  return (
    <div className="filterbar" role="group" aria-label="Фільтр цілей">
      {Object.entries(FILTERS).map(([key, label]) => (
        <Button
          key={key}
          small
          active={value === key}
          onClick={() => onChange(key)}
          aria-pressed={value === key}
        >
          {label}
          {key in stats && <span className="filterbar__count">{stats[key]}</span>}
        </Button>
      ))}
    </div>
  );
}
