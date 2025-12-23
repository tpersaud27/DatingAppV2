import { Component, effect, inject, signal } from '@angular/core';
import { MessagesService } from '../../../core/services/messages-service';
import { Conversation } from '../../../Types/Message';
import { MessageThread } from '../../messages/message-thread/message-thread';
import { MemberService } from '../../../core/services/member-service';

@Component({
  selector: 'app-member-messages',
  imports: [MessageThread],
  templateUrl: './member-messages.html',
  styleUrl: './member-messages.css',
})
export class MemberMessages {
  private messagesService = inject(MessagesService);
  private memberService = inject(MemberService);

  conversation = signal<Conversation | null>(null);

  constructor() {
    effect(() => {
      const member = this.memberService.member();
      if (!member) return;

      this.messagesService.getConversationWithUser(member.id).subscribe({
        next: (convo) => {
          console.log('conversation', convo);
          this.conversation.set(convo);
        },
      });
    });
  }
}
