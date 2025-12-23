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
  /** Server-generated ID (authoritative) */
  id: string;
  /** Client-generated ID used for optimistic updates & reconciliation */
  clientMessageId?: string;
  /** Conversation this message belongs to */
  conversationId: string;
  /** Sender / recipient */
  senderId: string;
  recipientId: string;
  /** Message body */
  content: string;
  /** ISO timestamps */
  messageSent: string;
  dateRead?: string | null;
  /* ============================
     UI-only state (NOT from API)
     ============================ */
  /** True while waiting for server confirmation */
  pending?: boolean;
  /** True if sending failed */
  failed?: boolean;
}

export interface CreateMessage {
  recipientId: string;
  content: string;
  clientMessageId?: string;
}
