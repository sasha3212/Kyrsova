const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const API_BASE = env.VITE_ARGUS_API || 'http://localhost:8090';
export const WS_URL = env.VITE_ARGUS_WS || 'ws://localhost:8090/ws/situation';
export const DEFAULT_MODE = 'normal';
export const REFRESH_MS = 5000;
export const SIM_STEP_SEC = 5;
