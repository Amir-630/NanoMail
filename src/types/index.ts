export interface Email {
  id: number;
  sender: string;
  avatar: string;
  subject: string;
  snippet: string;
  time: string;
  unreadCount?: number;
  read: boolean;
}