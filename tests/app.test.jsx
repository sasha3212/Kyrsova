import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from '../src/App.jsx';
import { decorateTarget, normalizeTrack } from '../src/lib/targets.js';
import { normalizeZone } from '../src/lib/zones.js';

const OP = { lat: 46.485, lon: 30.73 };

const TARGET = decorateTarget(normalizeTrack({
  id: 'AIR-1', label: 'SKY-1', kind: 'aircraft', affiliation: 'hostile',
  source: 'radar', lat: 46.44, lon: 30.7, altitude: 3200,
  speed: 420, course: 95, confidence: 0.9, ts: Date.now() - 4000,
}), OP);

const ZONE = normalizeZone({
  id: 'Z1', name: 'Зона Альфа', type: 'restricted',
  polygon: [[30.74, 46.47], [30.82, 46.47], [30.82, 46.4], [30.74, 46.4]],
});

const ALERT = {
  id: 'a1', targetLabel: 'SKY-1', zoneName: 'Зона Альфа',
  severity: 'critical', ts: Date.now(), domain: 'air',
};

function makeStores({ selected = null, status = 'ready' } = {}) {
  return {
    store: {
      clock: Date.now(),
      connectionStatus: 'online',
      connectionAttempt: 0,
      count: 1,
      updatedAt: Date.now(),
      isLoading: status === 'loading',
      status,
      stats: { total: 1, air: 1, surface: 0, alerting: 1 },
      filter: 'all',
      mapItems: [TARGET],
      listItems: [TARGET],
      selectedId: selected?.id || null,
      selected,
      error: 'Помилка каналу',
      alerts: [ALERT],
      refresh() {},
      setFilter() {},
      select() {},
      clearSelection() {},
      clearAlerts() {},
    },
    zonesStore: {
      isLoading: false,
      status: 'ready',
      sourceLabel: 'Мок-дані (normal)',
      submitting: false,
      fieldErrors: {},
      submitError: '',
      count: 1,
      zones: [ZONE],
      lastCreatedId: null,
      error: '',
      refresh() {},
      async create() { return false; },
      clearErrors() {},
    },
  };
}

describe('App · ARGUS', () => {
  it('renders the situation screen with map, stats and targets', () => {
    const html = renderToStaticMarkup(<App {...makeStores()} initialScreen="situation" />);
    expect(html).toContain('ARGUS');
    expect(html).toContain('повітряна обстановка');
    expect(html).toContain('SKY-1');
    expect(html).toContain('Канал активний');
    expect(html).toContain('map-svg');
    expect(html).toContain('Журнал тривог');
  });

  it('renders target details when a target is selected', () => {
    const html = renderToStaticMarkup(
      <App {...makeStores({ selected: TARGET })} initialScreen="situation" />,
    );
    expect(html).toContain('Картка цілі');
    expect(html).toContain('FL105');
    expect(html).toContain('Закрити');
  });

  it('renders the zones screen with form and zones', () => {
    const html = renderToStaticMarkup(<App {...makeStores()} initialScreen="zones" />);
    expect(html).toContain('Зони контролю ARGUS');
    expect(html).toContain('Нова зона контролю');
    expect(html).toContain('Зона Альфа');
    expect(html).toContain('Створити зону');
  });

  it('renders loading and error states', () => {
    const loading = renderToStaticMarkup(
      <App {...makeStores({ status: 'loading' })} initialScreen="situation" />,
    );
    expect(loading).toContain('Опитування джерел');
    const error = renderToStaticMarkup(
      <App {...makeStores({ status: 'error' })} initialScreen="situation" />,
    );
    expect(error).toContain('Канал даних недоступний');
  });
});
