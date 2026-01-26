import { MessagesSocketService } from './../../../core/services/messages-socket-service';
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
  private messagesSocketService = inject(MessagesSocketService);

  // INPUT AS SIGNAL
  public conversationId = input<string>();
  public recipientId = input<string>();

  public messages = signal<Message[]>([]);
  public isSending = signal<boolean>(false);
  public currentUserId = this.accountService.currentUser()?.id;

  @ViewChild('messagesContainer')
  private messagesContainer?: ElementRef<HTMLDivElement>;

  constructor() {
    // 1️⃣ React to conversation changes (REST)
    effect((): void => {
      const id = this.conversationId();
      if (!id) return;

      console.log('conversationId changed →', id);
      this.loadMessages(id);
    });

    // 2️⃣ Listen for live WebSocket messages (once)
    // this.messagesSocketService.onMessage((message): void => {
    //   // Defensive typing
    //   if (!message || typeof message !== 'object') return;

    //   const incoming = message as Message;

    //   // Only append messages for this conversation
    //   if (incoming.conversationId !== this.conversationId()) return;

    //   // Deduplicate
    //   this.messages.update((msgs) =>
    //     msgs.some((m) => m.id === incoming.id) ? msgs : [...msgs, incoming]
    //   );

    //   this.scrollToBottom();
    // });
  }

  public onSendMessage(input: HTMLInputElement): void {
    const content = input.value.trim();
    const recipientId = this.recipientId();

    if (!content || !recipientId) return;

    // 1️⃣ Persist via REST (source of truth)
    this.messagesService
      .sendMessage({
        recipientId,
        content,
      })
      .subscribe({
        next: (saved) => {
          // 2️⃣ Deliver via WebSocket
          // this.messagesSocketService.send('sendMessage', {
          //   recipientId,
          //   content,
          //   conversationId: saved.conversationId,
          //   senderId: saved.senderId,
          // });

          // 3️⃣ Update UI immediately
          this.messages.update((msgs) => [...msgs, saved]);
          this.scrollToBottom();
        },
      });

    input.value = '';
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
