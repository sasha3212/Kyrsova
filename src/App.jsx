import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { AlertList } from './components/AlertList.jsx';
import { Button } from './components/Button.jsx';
import { ConnectionBar } from './components/ConnectionBar.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { Header } from './components/Header.jsx';
import { Legend } from './components/Legend.jsx';
import { SituationMap } from './components/SituationMap.jsx';
import { StatsStrip } from './components/StatsStrip.jsx';
import { TargetDetails } from './components/TargetDetails.jsx';
import { TargetList } from './components/TargetList.jsx';
import { ZoneForm } from './components/ZoneForm.jsx';
import { ZoneList } from './components/ZoneList.jsx';
import { AREA } from './data/area.js';
import { formatClock } from './lib/format.js';

function readHash() {
  if (typeof window === 'undefined') return 'situation';
  return window.location.hash === '#zones' ? 'zones' : 'situation';
}

export const App = observer(function App({ store, zonesStore, initialScreen }) {
  const [screen, setScreen] = useState(() => initialScreen || readHash());

  useEffect(() => {
    function onHashChange() { setScreen(readHash()); }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function go(next) {
    setScreen(next);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${next}`);
    }
  }

  const listStatus = store.isLoading ? 'loading' : store.status;

  return (
    <div className="app">
      <Header clock={store.clock} status={store.connectionStatus} areaName={AREA.name} />
      <main className="app-main" id="main">
        {screen === 'zones' ? (
          <>
            <div className="screen-head">
              <div>
                <h1 className="screen-title" tabIndex={-1}>Зони контролю ARGUS</h1>
                <p className="screen-lead">
                  Сформуйте акваторію та повітряний простір. Джерело: {zonesStore.sourceLabel}.
                </p>
              </div>
              <Button variant="secondary" small onClick={() => go('situation')}>← Обстановка</Button>
            </div>

            <ZoneForm
              onSubmit={(values) => zonesStore.create(values)}
              submitting={zonesStore.submitting}
              fieldErrors={zonesStore.fieldErrors}
              submitError={zonesStore.submitError}
              onClearErrors={() => zonesStore.clearErrors()}
            />

            <section className="zones" aria-labelledby="zones-title">
              <div className="section-head">
                <h2 id="zones-title" className="section-title">Активні зони ({zonesStore.count})</h2>
                <Button variant="ghost" small busy={zonesStore.isLoading} onClick={() => zonesStore.refresh()}>
                  Оновити
                </Button>
              </div>
              <ZoneList
                status={zonesStore.isLoading ? 'loading' : zonesStore.status}
                zones={zonesStore.zones}
                error={zonesStore.error}
                newId={zonesStore.lastCreatedId}
                onRetry={() => zonesStore.refresh()}
              />
            </section>
            <p className="visually-hidden" role="status" aria-live="polite">
              {`Завантажено ${zonesStore.count} зон.`}
            </p>
          </>
        ) : (
          <>
            <h1 className="visually-hidden">ARGUS — повітряна обстановка над акваторією</h1>
            <ConnectionBar
              status={store.connectionStatus}
              attempt={store.connectionAttempt}
              count={store.count}
              updated={formatClock(store.updatedAt)}
            />
            <StatsStrip stats={store.stats} />
            <div className="toolbar">
              <FilterBar value={store.filter} onChange={(f) => store.setFilter(f)} stats={store.stats} />
              <Button variant="secondary" small busy={store.isLoading} onClick={() => store.refresh()}>
                Оновити
              </Button>
              <Button variant="secondary" small onClick={() => go('zones')}>Зони</Button>
            </div>

            <div className="situation-grid">
              <div className="situation-grid__map">
                <SituationMap
                  targets={store.mapItems}
                  zones={zonesStore.zones}
                  selectedId={store.selectedId}
                  onSelect={(id) => store.select(id)}
                />
                <TargetDetails target={store.selected} onClose={() => store.clearSelection()} />
                <Legend />
              </div>
              <aside className="situation-grid__side" aria-label="Список цілей та журнал тривог">
                <section className="contacts" aria-labelledby="targets-title">
                  <div className="section-head">
                    <h2 id="targets-title" className="section-title">Виявлені цілі</h2>
                    <span className="section-count">{store.listItems.length}</span>
                  </div>
                  <TargetList
                    status={listStatus}
                    targets={store.listItems}
                    error={store.error}
                    selectedId={store.selectedId}
                    onSelect={(id) => store.select(id)}
                    onRetry={() => store.refresh()}
                  />
                </section>
                <AlertList alerts={store.alerts} onClear={() => store.clearAlerts()} />
              </aside>
            </div>
            <p className="visually-hidden" role="status" aria-live="polite">
              {`Виявлено ${store.count} цілей; тривожних — ${store.stats.alerting}.`}
            </p>
          </>
        )}
      </main>

      <nav className="tabbar" aria-label="Навігація розділами" role="navigation">
        <button
          type="button"
          className={`tabbar__item ${screen === 'situation' ? 'is-active' : ''}`}
          aria-current={screen === 'situation' ? 'page' : undefined}
          onClick={() => go('situation')}
        >
          ◎ Обстановка
        </button>
        <button
          type="button"
          className={`tabbar__item ${screen === 'zones' ? 'is-active' : ''}`}
          aria-current={screen === 'zones' ? 'page' : undefined}
          onClick={() => go('zones')}
        >
          ▣ Зони
        </button>
        <span className="tabbar__spacer" />
        <span className="tabbar__meta">ARGUS · курсова робота</span>
      </nav>
    </div>
  );
});
