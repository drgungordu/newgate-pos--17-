export interface RealtimeEvent<T = unknown> {
  id: string;
  type: string;
  payload: T;
  timestamp: string;
}

export interface RealtimeOptions {
  url: string;
  token?: string;
  onEvent: (event: RealtimeEvent) => void;
  onStatus?: (status: 'CONNECTING' | 'OPEN' | 'CLOSED' | 'ERROR') => void;
}

export class RealtimeTransport {
  private socket: WebSocket | null = null;
  private closedByUser = false;
  private reconnectAttempt = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private readonly replayIds = new Set<string>();

  constructor(private readonly options: RealtimeOptions) {}

  connect(): void {
    if (this.closedByUser || this.socket || !this.options.url) return;
    this.options.onStatus?.('CONNECTING');
    try {
      const url = this.options.token
        ? `${this.options.url}${this.options.url.includes('?') ? '&' : '?'}token=${encodeURIComponent(this.options.token)}`
        : this.options.url;
      this.socket = new WebSocket(url);
      this.socket.onopen = () => {
        this.reconnectAttempt = 0;
        this.options.onStatus?.('OPEN');
        this.heartbeatTimer = setInterval(() => this.socket?.send(JSON.stringify({ type: 'heartbeat' })), 30_000);
        this.socket.send(JSON.stringify({ type: 'replay.request' }));
      };
      this.socket.onmessage = event => {
        try {
          const message = JSON.parse(String(event.data)) as RealtimeEvent;
          if (!message.id || this.replayIds.has(message.id)) return;
          this.replayIds.add(message.id);
          if (this.replayIds.size > 5000) this.replayIds.delete(this.replayIds.values().next().value as string);
          this.options.onEvent(message);
        } catch {
          this.options.onStatus?.('ERROR');
        }
      };
      this.socket.onerror = () => this.options.onStatus?.('ERROR');
      this.socket.onclose = () => {
        this.clearHeartbeat();
        this.socket = null;
        this.options.onStatus?.('CLOSED');
        if (!this.closedByUser) {
          const delay = Math.min(30_000, 500 * (2 ** this.reconnectAttempt++));
          window.setTimeout(() => this.connect(), delay);
        }
      };
    } catch {
      this.options.onStatus?.('ERROR');
      this.socket = null;
    }
  }

  publish<T>(event: RealtimeEvent<T>): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return false;
    this.socket.send(JSON.stringify(event));
    return true;
  }

  close(): void {
    this.closedByUser = true;
    this.clearHeartbeat();
    this.socket?.close();
    this.socket = null;
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }
}
