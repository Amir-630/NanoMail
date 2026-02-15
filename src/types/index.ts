export interface Email {
  id: number;
  sender: string;
  senderEmail?: string;
  avatar: string;
  subject: string;
  snippet: string;
  body?: string;
  time: string;
  date: Date | string;
  unreadCount?: number;
  read: boolean;
  category: 'inbox' | 'sent' | 'drafts' | 'trash';
}