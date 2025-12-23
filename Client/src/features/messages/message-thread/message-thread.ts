import { FormsModule } from '@angular/forms';
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
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    DatePipe,
    FormsModule,
  ],
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
  isSending = signal<boolean>(false);
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
    if (this.isSending()) return;

    const content: string = input.value.trim();
    const recipientId: string | undefined = this.recipientId();

    if (!content || !recipientId) return;

    this.isSending.set(true);
    // 🔹 Send to API and WAIT
    this.messagesService.sendMessage({ recipientId, content }).subscribe({
      next: (serverMessage: Message): void => {
        // ✅ Append ONLY what the server returns
        this.messages.update((msgs) => [...msgs, serverMessage]);

        input.value = '';
        this.isSending.set(false);
      },
      error: (): void => {
        console.error('Failed to send message');
        this.isSending.set(false);
      },
    });
  }

  private loadMessages(conversationId: string) {
    this.messagesService.getMessages(conversationId).subscribe({
      next: (msgs) => this.messages.set(msgs),
    });
  }
}
