import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessagesSocketService {
  private socket?: WebSocket;

  public connect(userId: string): void {
    if (this.socket) return;

    this.socket = new WebSocket(`${environment.wsUrl}?userId=${userId}`);
  }

  public send(action: string, payload: Record<string, unknown>): void {
    this.socket?.send(JSON.stringify({ action, ...payload }));
  }

  public onMessage(handler: (msg: unknown) => void): void {
    this.socket?.addEventListener('message', (event) => {
      handler(JSON.parse(event.data));
    });
  }

  public disconnect(): void {
    this.socket?.close();
    this.socket = undefined;
  }
}
