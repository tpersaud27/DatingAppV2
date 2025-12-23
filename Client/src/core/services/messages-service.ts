import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation, CreateMessage, Message } from '../../Types/Message';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  // Dependencies
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Returns list of all conversations
  public getAllConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.baseUrl}messages/conversations`);
  }

  public getMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}messages/conversations/${conversationId}`);
  }

  public sendMessage(payload: { recipientId: string; content: string }) {
    return this.http.post<CreateMessage>(`${this.baseUrl}messages`, payload);
  }
}
