import { makeAutoObservable, observable, runInAction } from 'mobx';
import { createZone, fetchZones, resolveMode } from '../api.js';
import { normalizeZone, validateZoneInput } from '../lib/zones.js';

export class ZonesStore {
  zones = observable.array([]);
  status = 'loading';
  error = '';
  submitting = false;
  fieldErrors = {};
  submitError = '';
  lastCreatedId = null;
  mode = null;

  constructor({ search = '', onZonesChanged = () => {} } = {}) {
    this.search = search;
    this.mode = resolveMode(search);
    this.onZonesChanged = onZonesChanged;
    makeAutoObservable(this, {
      zones: observable,
      search: false,
      onZonesChanged: false,
    });
  }

  async start() {
    await this.load();
  }

  async load() {
    this.status = 'loading';
    this.error = '';
    try {
      const raw = await fetchZones({ search: this.search });
      runInAction(() => {
        this.zones.clear();
        for (const item of raw) {
          const zone = normalizeZone(item);
          if (zone) this.zones.push(zone);
        }
        this.status = this.zones.length ? 'ready' : 'empty';
        this.onZonesChanged();
      });
    } catch (error) {
      runInAction(() => {
        this.status = 'error';
        this.error = error?.message || 'Не вдалося завантажити зони.';
      });
    }
  }

  async create(values) {
    const result = validateZoneInput(values);
    if (!result.ok) {
      runInAction(() => {
        this.fieldErrors = result.errors;
        this.submitError = '';
      });
      return false;
    }
    this.submitting = true;
    this.fieldErrors = {};
    this.submitError = '';
    try {
      const created = await createZone(values, { search: this.search });
      const zone = normalizeZone(created);
      if (!zone) throw new Error('Сервер повернув некоректну зону.');
      runInAction(() => {
        this.zones.unshift(zone);
        this.lastCreatedId = zone.id;
        this.status = 'ready';
        this.submitting = false;
        this.onZonesChanged();
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.submitError = error?.message || 'Не вдалося створити зону.';
        this.submitting = false;
      });
      return false;
    }
  }

  clearErrors() {
    this.fieldErrors = {};
    this.submitError = '';
  }

  async refresh() {
    await this.load();
  }

  get count() {
    return this.zones.length;
  }

  get isLoading() {
    return this.status === 'loading';
  }

  get sourceLabel() {
    return this.mode ? `Мок-дані (${this.mode})` : 'API ARGUS';
  }
}
