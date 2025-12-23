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

  // Inbox: list all conversations for current user
  public getAllConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.baseUrl}messages/conversations`);
  }

  // Load messages for a conversation
  public getMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}messages/conversations/${conversationId}`);
  }

  public sendMessage(payload: { recipientId: string; content: string }): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}messages`, payload);
  }

  // Profile page: get or create conversation with a specific user
  public getConversationWithUser(otherUserId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.baseUrl}messages/conversations/with/${otherUserId}`);
  }
}
