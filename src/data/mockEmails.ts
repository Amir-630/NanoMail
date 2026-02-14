import type{ Email } from '../types';

export const mockEmails: Email[] = [
  {
    id: 1,
    sender: 'Jack Smith',
    avatar: 'https://i.pravatar.cc/150?u=jack',
    subject: 'New Business Opportunities',
    snippet: 'Dear Sam, Hope this email finds you well. I would like t...',
    time: 'Now',
    unreadCount: 3,
    read: false,
  },
  {
    id: 2,
    sender: 'Sarah Pruett',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    subject: 'RE: Project Progress',
    snippet: 'Reminder on the mentioned bel...',
    time: 'Yesterday',
    unreadCount: 2,
    read: false,
  },
  // ... add more mock data as needed
];