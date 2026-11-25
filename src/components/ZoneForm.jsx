import { useState } from 'react';
import { ZONE_TYPES, ZONE_TYPE_KEYS, polygonToString } from '../lib/zones.js';
import { Button } from './Button.jsx';

const EMPTY = {
  name: '',
  type: 'restricted',
  polygonText: '30.74, 46.47; 30.82, 46.47; 30.82, 46.40; 30.74, 46.40',
  alertOnEntry: true,
};

export function ZoneForm({ onSubmit, submitting, fieldErrors = {}, submitError, onClearErrors }) {
  const [values, setValues] = useState(EMPTY);

  function set(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    onClearErrors?.();
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      name: values.name,
      type: values.type,
      polygonText: values.polygonText,
      alertOnEntry: values.alertOnEntry,
    });
  }

  return (
    <form className="zone-form" onSubmit={handleSubmit} noValidate>
      <div className="section-head">
        <h2 className="section-title">Нова зона контролю</h2>
      </div>
      <div className="zone-form__grid">
        <label className="field">
          <span>Назва</span>
          <input
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Наприклад, Заборонена зона «Альфа»"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'err-name' : undefined}
          />
          {fieldErrors.name && <em id="err-name" role="alert">{fieldErrors.name}</em>}
        </label>
        <label className="field">
          <span>Тип</span>
          <select value={values.type} onChange={(e) => set('type', e.target.value)}>
            {ZONE_TYPE_KEYS.map((key) => (
              <option key={key} value={key}>{ZONE_TYPES[key].label}</option>
            ))}
          </select>
        </label>
        <label className="field field--wide">
          <span>Полігон (довгота, широта; …)</span>
          <textarea
            rows={2}
            value={values.polygonText}
            onChange={(e) => set('polygonText', e.target.value)}
            aria-invalid={Boolean(fieldErrors.polygon)}
            aria-describedby={fieldErrors.polygon ? 'err-polygon' : 'hint-polygon'}
          />
          <small id="hint-polygon">Мінімум 3 точки, формат: 30.74, 46.47; 30.82, 46.47; …</small>
          {fieldErrors.polygon && <em id="err-polygon" role="alert">{fieldErrors.polygon}</em>}
        </label>
        <label className="field field--check">
          <input
            type="checkbox"
            checked={values.alertOnEntry}
            onChange={(e) => set('alertOnEntry', e.target.checked)}
          />
          <span>Сповіщати при вході цілі</span>
        </label>
      </div>
      {submitError && <p className="zone-form__error" role="alert">{submitError}</p>}
      <div className="zone-form__actions">
        <Button type="submit" busy={submitting} disabled={submitting}>
          {submitting ? 'Створення…' : 'Створити зону'}
        </Button>
        <Button variant="ghost" onClick={() => setValues(EMPTY)} disabled={submitting}>
          Скинути
        </Button>
      </div>
    </form>
  );
}

export function PolygonPreview({ polygon }) {
  return <code>{polygonToString(polygon)}</code>;
}
