export interface Conversation {
  id: string;
  otherUserId: string;
  otherUserDisplayName?: string;
  lastMessage?: MessagePreview;
}
export interface MessagePreview {
  id: string;
  content: string;
  messageSent: Date;
  isRead: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  messageSent: string;
  dateRead?: string;
}

export interface CreateMessage {
  recipientId: string;
  content: string;
  clientMessageId?: string;
}
