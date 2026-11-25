import { SIM_STEP_SEC, WS_URL } from './config.js';

export class TrackStream {
  constructor({ onTick, onUpdate, onStatus, mode = null, intervalMs = SIM_STEP_SEC * 1000 } = {}) {
    this.onTick = onTick || (() => {});
    this.onUpdate = onUpdate || (() => {});
    this.onStatus = onStatus || (() => {});
    this.mode = mode;
    this.intervalMs = intervalMs;
    this.timer = null;
    this.socket = null;
    this.attempt = 0;
    this.reconnectTimer = null;
    this.stopped = false;
  }

  start() {
    this.stopped = false;
    if (this.mode) {
      this.onStatus('online', 0);
      this.timer = setInterval(() => this.onTick(), this.intervalMs);
      return;
    }
    this.connect();
  }

  connect() {
    if (this.stopped) return;
    this.onStatus('connecting', this.attempt);
    try {
      const socket = new WebSocket(WS_URL);
      this.socket = socket;
      socket.onopen = () => {
        this.attempt = 0;
        this.onStatus('online', 0);
      };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message?.type === 'track.update' && message.data) {
            this.onUpdate(message.data);
          }
        } catch {
          this.onStatus('error', this.attempt);
        }
      };
      socket.onclose = () => this.scheduleReconnect();
      socket.onerror = () => {
        try { socket.close(); } catch { this.scheduleReconnect(); }
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.stopped) {
      this.onStatus('offline', this.attempt);
      return;
    }
    this.attempt += 1;
    this.onStatus('reconnecting', this.attempt);
    const delay = Math.min(1000 * 2 ** Math.min(this.attempt, 5), 30_000);
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  stop() {
    this.stopped = true;
    if (this.timer) clearInterval(this.timer);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      try { this.socket.close(); } catch { this.socket = null; }
    }
    this.timer = null;
    this.socket = null;
  }
}
