import type { Email } from '../types';

export const mockEmails: Email[] = [
  {
    id: 1,
    sender: 'Jack Smith',
    senderEmail: 'jack@example.com',
    avatar: 'https://i.pravatar.cc/150?u=jack',
    subject: 'New Business Opportunities',
    snippet: 'Dear Sam, Hope this email finds you well. I would like t...',
    body: 'Dear Sam,\n\nHope this email finds you well. I would like to discuss new business opportunities that could be beneficial for both of our companies. We have identified several areas where we can collaborate and create mutual value.\n\nI would appreciate if we could schedule a meeting next week to discuss this further.\n\nBest regards,\nJack Smith\nBusiness Development Manager',
    time: 'Now',
    date: new Date(),
    unreadCount: 3,
    read: false,
    category: 'inbox'
  },
  {
    id: 2,
    sender: 'Sarah Pruett',
    senderEmail: 'sarah@example.com',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    subject: 'RE: Project Progress',
    snippet: 'Reminder on the mentioned bel...',
    body: 'Hi Sam,\n\nAs a reminder, the project progress update is due by end of this week. Please ensure all team members submit their progress reports.\n\nKey points to include:\n- Completed tasks\n- Ongoing work\n- Any blockers\n- Next week\'s goals\n\nThanks!\nSarah Pruett\nProject Manager',
    time: 'Yesterday',
    date: new Date(Date.now() - 86400000),
    unreadCount: 2,
    read: false,
    category: 'inbox'
  },
  {
    id: 3,
    sender: 'Mike Johnson',
    senderEmail: 'mike@example.com',
    avatar: 'https://i.pravatar.cc/150?u=mike',
    subject: 'Team Meeting Summary',
    snippet: 'Here are the key points from today\'s team meeting...',
    body: 'Team,\n\nThank you for attending today\'s meeting. Here\'s a summary of what we discussed:\n\n1. Q1 Goals - On track\n2. Budget review - Approved\n3. New hires - Starting next week\n4. Team building event - Planning phase\n\nAction items will be sent separately. Great work everyone!\n\nBest,\nMike Johnson',
    time: '2 days ago',
    date: new Date(Date.now() - 172800000),
    read: true,
    category: 'inbox'
  },
  {
    id: 4,
    sender: 'You',
    senderEmail: 'sam.jones@example.com',
    avatar: 'https://i.pravatar.cc/150?u=sam',
    subject: 'RE: Project Progress',
    snippet: 'Thank you for the reminder. Here\'s our progress update...',
    body: 'Hi Sarah,\n\nThank you for the reminder. Here\'s the progress update from our team:\n\nCompleted:\n- Database schema finalized\n- API endpoints implemented\n- Unit tests written (85% coverage)\n\nOngoing:\n- Integration testing\n- Documentation\n\nNo blockers at the moment.\n\nBest regards,\nSam Jones',
    time: '2 days ago',
    date: new Date(Date.now() - 172800000),
    read: true,
    category: 'sent'
  },
  {
    id: 5,
    sender: 'You',
    senderEmail: 'sam.jones@example.com',
    avatar: 'https://i.pravatar.cc/150?u=sam',
    subject: 'Meeting Request - Next Week',
    snippet: 'I would like to schedule a meeting with you next week...',
    body: 'Hi Jack,\n\nI would like to schedule a meeting with you next week to discuss the business opportunities you mentioned. I\'m interested in learning more about the potential collaboration.\n\nWould Tuesday or Wednesday afternoon work for you?\n\nLooking forward to hearing from you.\n\nBest,\nSam Jones',
    time: '3 days ago',
    date: new Date(Date.now() - 259200000),
    read: true,
    category: 'sent'
  }
];