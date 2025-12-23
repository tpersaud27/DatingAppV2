import { Component, effect, inject, input, Input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AccountService } from '../../../core/services/account-service';
import { MessagesService } from '../../../core/services/messages-service';
import { Message } from '../../../Types/Message';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-message-thread',
  imports: [MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, DatePipe],
  templateUrl: './message-thread.html',
  styleUrl: './message-thread.css',
})
export class MessageThread {
  private messagesService = inject(MessagesService);
  private accountService = inject(AccountService);

  // INPUT AS SIGNAL
  conversationId = input<string>();
  recipientId = input<string>();

  messages = signal<Message[]>([]);
  currentUserId = this.accountService.currentUser()?.id;

  constructor() {
    effect(() => {
      const id = this.conversationId();
      if (!id) return;

      console.log('conversationId changed →', id);
      this.loadMessages(id);
    });
  }

  public onSendMessage(input: HTMLInputElement): void {
    const content = input.value.trim();
    const recipientId = this.recipientId();

    if (!content || !recipientId) return;

    this.messagesService.sendMessage({ recipientId, content }).subscribe({
      next: (message) => {
        console.log('Message ', message);
      },
      error: () => {
        console.log('Error while sending message!');
      },
    });

    input.value = '';
  }

  private loadMessages(conversationId: string) {
    this.messagesService.getMessages(conversationId).subscribe({
      next: (msgs) => this.messages.set(msgs),
    });
  }
}
