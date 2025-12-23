import { Component, inject, signal } from '@angular/core';
import { MessagesService } from '../../core/services/messages-service';
import { Conversation } from '../../Types/Message';
import { MatListModule } from '@angular/material/list';
import { DatePipe } from '@angular/common';
import { MessageThread } from './message-thread/message-thread';

@Component({
  selector: 'app-messages',
  imports: [MatListModule, DatePipe, MessageThread],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages {
  private messagesService = inject(MessagesService);

  conversations = signal<Conversation[]>([]);
  selectedConversationId = signal<string | null>(null);

  constructor() {
    this.loadInbox();
  }

  loadInbox() {
    this.messagesService.getAllConversations().subscribe((data: Conversation[]) => {
      console.log('Conversations: ', data);
      this.conversations.set(data);
    });
  }

  selectConversation(conversationId: string) {
    this.selectedConversationId.set(conversationId);
  }
}
