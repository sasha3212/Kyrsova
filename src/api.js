import { API_BASE } from './config.js';
import { buildMockTracks, buildMockZonePayload } from './data/mockTargets.js';
import { normalizeZone } from './lib/zones.js';

function modeFrom(search) {
  if (typeof search === 'string') {
    const value = new URLSearchParams(search).get('mock');
    return value || null;
  }
  if (typeof window !== 'undefined') {
    return new URLSearchParams(window.location.search).get('mock');
  }
  return null;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.detail || body?.message) detail = body.detail || body.message;
    } catch {
      detail = `HTTP ${response.status}`;
    }
    throw new Error(detail);
  }
  return response.json();
}

export function resolveMode(search) {
  return modeFrom(search);
}

export async function fetchTracks({ signal, search } = {}) {
  const mode = modeFrom(search);
  if (mode) {
    if (mode === 'error') throw new Error('Демонстраційна помилка каналу даних.');
    return buildMockTracks(mode);
  }
  const data = await requestJson(`${API_BASE}/api/v1/tracks`, { signal });
  return Array.isArray(data) ? data : data?.items || [];
}

export async function fetchZones({ signal, search } = {}) {
  const mode = modeFrom(search);
  if (mode) return buildMockZonePayload();
  const data = await requestJson(`${API_BASE}/api/v1/zones`, { signal });
  return Array.isArray(data) ? data : data?.items || [];
}

export async function createZone(payload, { search } = {}) {
  const mode = modeFrom(search);
  const normalized = normalizeZone(payload);
  if (!normalized) throw new Error('Некоректні дані зони.');
  if (mode) {
    return { ...normalized, id: `zon-local-${Date.now().toString(36)}` };
  }
  return requestJson(`${API_BASE}/api/v1/zones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
