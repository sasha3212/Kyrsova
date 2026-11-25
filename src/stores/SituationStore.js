import { makeAutoObservable, observable, runInAction } from 'mobx';
import { fetchTracks, resolveMode } from '../api.js';
import { TrackStream } from '../stream.js';
import { OBSERVATION_POST } from '../data/area.js';
import {
  compareTargets,
  decorateTarget,
  matchesFilter,
  normalizeTrack,
} from '../lib/targets.js';
import { detectZoneEvents } from '../lib/zones.js';
import { simulateStep } from '../lib/simulation.js';
import { SIM_STEP_SEC } from '../config.js';

export class SituationStore {
  tracks = observable.map();
  alerts = observable.array([]);
  inside = observable.set();
  status = 'loading';
  error = '';
  connectionStatus = 'offline';
  connectionAttempt = 0;
  selectedId = null;
  filter = 'all';
  clock = Date.now();
  mode = null;
  origin = OBSERVATION_POST;
  updatedAt = null;
  stream = null;

  constructor({ search = '', zonesProvider = () => [] } = {}) {
    this.search = search;
    this.mode = resolveMode(search);
    this.zonesProvider = zonesProvider;
    makeAutoObservable(this, {
      tracks: observable,
      alerts: observable,
      inside: observable,
      origin: false,
      zonesProvider: false,
      search: false,
      stream: false,
    });
  }

  async start() {
    await this.load();
    this.startStream();
    this.clockTimer = setInterval(() => this.tickClock(), 1000);
  }

  async load() {
    this.status = 'loading';
    this.error = '';
    try {
      const raw = await fetchTracks({ search: this.search });
      runInAction(() => {
        this.tracks.clear();
        this.inside.clear();
        this.alerts.clear();
        for (const item of raw) this.mergeTrack(item, { collectAlerts: false });
        this.status = this.tracks.size ? 'ready' : 'empty';
        this.updatedAt = Date.now();
      });
    } catch (error) {
      runInAction(() => {
        this.status = 'error';
        this.error = error?.message || 'Не вдалося завантажити обстановку.';
      });
    }
  }

  startStream() {
    if (this.stream) this.stream.stop();
    this.stream = new TrackStream({
      mode: this.mode,
      intervalMs: SIM_STEP_SEC * 1000,
      onStatus: (status, attempt) => {
        runInAction(() => {
          this.connectionStatus = status;
          this.connectionAttempt = attempt;
        });
      },
      onTick: () => this.simulate(),
      onUpdate: (raw) => this.mergeTrack(raw),
    });
    this.stream.start();
  }

  simulate() {
    const next = simulateStep(Array.from(this.tracks.values()), SIM_STEP_SEC);
    runInAction(() => {
      for (const track of next) this.mergeTrack(track);
      this.clock = Date.now();
      this.updatedAt = Date.now();
    });
  }

  mergeTrack(raw, { collectAlerts = true } = {}) {
    const track = normalizeTrack(raw);
    if (!track) return;
    const existing = this.tracks.get(track.id);
    if (existing && existing.ts > track.ts) return;
    this.tracks.set(track.id, track);
    if (collectAlerts) this.collectAlerts([track]);
  }

  collectAlerts(targets) {
    const zones = this.zonesProvider() || [];
    if (!zones.length) return;
    const decorated = targets.map((target) =>
      target.domain ? target : decorateTarget(target, this.origin, Date.now()),
    );
    const { events, nextInside } = detectZoneEvents(decorated, zones, this.inside);
    for (const key of nextInside) this.inside.add(key);
    for (const event of events) {
      if (!this.alerts.some((a) => a.id === event.id)) {
        this.alerts.unshift(event);
      }
    }
    if (this.alerts.length > 40) this.alerts.length = 40;
  }

  syncWithZones() {
    this.alerts.clear();
    this.inside.clear();
    this.collectAlerts(Array.from(this.tracks.values()));
  }

  select(id) {
    this.selectedId = this.selectedId === id ? null : id;
  }

  clearSelection() {
    this.selectedId = null;
  }

  setFilter(filter) {
    this.filter = filter;
  }

  clearAlerts() {
    this.alerts.clear();
  }

  tickClock() {
    this.clock = Date.now();
  }

  async refresh() {
    await this.load();
  }

  stop() {
    if (this.stream) this.stream.stop();
    if (this.clockTimer) clearInterval(this.clockTimer);
  }

  get items() {
    void this.clock;
    return Array.from(this.tracks.values())
      .map((track) => decorateTarget(track, this.origin, Date.now()))
      .sort(compareTargets);
  }

  get mapItems() {
    return this.items.filter((target) => matchesFilter(target, this.filter));
  }

  get listItems() {
    return this.items.filter((target) => matchesFilter(target, this.filter));
  }

  get selected() {
    return this.selectedId ? this.items.find((t) => t.id === this.selectedId) || null : null;
  }

  get count() {
    return this.tracks.size;
  }

  get stats() {
    const items = this.items;
    return {
      total: items.length,
      air: items.filter((t) => t.domain === 'air').length,
      surface: items.filter((t) => t.domain === 'surface').length,
      alerting: items.filter((t) => t.alerting).length,
    };
  }

  get isLoading() {
    return this.status === 'loading';
  }

  get sourceLabel() {
    return this.mode ? `Мок-дані (${this.mode})` : 'API ARGUS';
  }
}
