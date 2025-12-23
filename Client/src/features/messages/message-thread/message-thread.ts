import { FormsModule } from '@angular/forms';
import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  Input,
  signal,
  ViewChild,
} from '@angular/core';
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
  public conversationId = input<string>();
  public recipientId = input<string>();

  public messages = signal<Message[]>([]);
  public isSending = signal<boolean>(false);
  public currentUserId = this.accountService.currentUser()?.id;

  @ViewChild('messagesContainer')
  private messagesContainer?: ElementRef<HTMLDivElement>;

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
        queueMicrotask(() => {
          this.scrollToBottom();
        });
      },
      error: (): void => {
        console.error('Failed to send message');
        this.isSending.set(false);
      },
    });
  }

  private loadMessages(conversationId: string): void {
    this.messagesService.getMessages(conversationId).subscribe({
      next: (msgs) => {
        this.messages.set(msgs);

        queueMicrotask(() => {
          this.scrollToBottom();
        });
      },
    });
  }

  private scrollToBottom(): void {
    // If the container isn't available yet, do nothing.
    const el: HTMLDivElement | undefined = this.messagesContainer?.nativeElement;
    if (!el) return;

    // Defer until after Angular renders the @for updates
    requestAnimationFrame((): void => {
      el.scrollTop = el.scrollHeight;
    });
  }
}
