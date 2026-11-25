import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import { SituationStore } from './stores/SituationStore.js';
import { ZonesStore } from './stores/ZonesStore.js';
import './styles/tokens.css';
import './styles/styles.css';

const search = typeof window !== 'undefined' ? window.location.search : '';

const store = new SituationStore({ search, zonesProvider: () => zonesStore.zones });
const zonesStore = new ZonesStore({ search, onZonesChanged: () => store.syncWithZones() });

const root = createRoot(document.getElementById('root'));
root.render(<App store={store} zonesStore={zonesStore} />);

store.start();
zonesStore.start();

if (typeof window !== 'undefined') {
  window.argus = { store, zonesStore };
}
