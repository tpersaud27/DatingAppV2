import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class MessagesSocketService {
  private authService = inject(AuthService);

  private socket?: WebSocket;

  public onConnect(): void {
    // If we already have a socket that is OPEN or CONNECTING, don't create another
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    // Get the JWT token
    const token = this.authService.getIdToken();
    if (!token) {
      throw new Error('Cannot connect websocket: missing id_token');
    }
    const wsUrl = `${environment.wsUrl}?token=${encodeURIComponent(token)}`;
    this.socket = new WebSocket(wsUrl);

    // Basic logging
    this.socket.addEventListener('open', () => console.log('WS connected'));
    this.socket.addEventListener('close', (e) => console.log('WS closed', e.code, e.reason));
    this.socket.addEventListener('error', (e) => console.error('WS error', e));
  }

  public onSend(action: string, payload: Record<string, unknown> = {}): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WS not open; message not sent', { action, payload });
      return;
    }

    this.socket.send(JSON.stringify({ action, ...payload }));
  }

  public onMessage(handler: (msg: unknown) => void): void {
    if (!this.socket) return;

    // Avoid crashing if server sends non-JSON
    this.socket.addEventListener('message', (event) => {
      try {
        handler(JSON.parse(event.data));
      } catch {
        handler(event.data);
      }
    });
  }

  public onDisconnect(code = 1000, reason = 'client_disconnect'): void {
    this.socket?.close(code, reason);
    this.socket = undefined;
  }
}
