import React, { useState } from 'react';
import { M3Typography, M3TextField, M3Button, M3IconButton, M3Dialog, M3DialogTitle, M3DialogContent, M3DialogActions } from 'm3r';
import { Close, Send } from '@mui/icons-material';
import type { Email } from '../../types';

interface ComposeEmailProps {
  open: boolean;
  onClose: () => void;
  onSend: (email: Email) => void;
}

export const ComposeEmail: React.FC<ComposeEmailProps> = ({ open, onClose, onSend }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    if (!to || !subject || !body) {
      alert('Please fill in all fields');
      return;
    }

    const newEmail: Email = {
      id: Math.max(...[0]) + 1,
      sender: 'You',
      senderEmail: 'sam.jones@example.com',
      avatar: 'https://i.pravatar.cc/150?u=sam',
      subject,
      snippet: body.substring(0, 100) + '...',
      body,
      time: 'Now',
      date: new Date(),
      read: true,
      category: 'sent'
    };

    onSend(newEmail);

    // Reset form
    setTo('');
    setSubject('');
    setBody('');
    onClose();
  };

  return (
    <M3Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <M3DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* @ts-ignore */}
        <M3Typography variant="headline">Compose Email</M3Typography>
        <M3IconButton onClick={onClose} size="small">
          <Close />
        </M3IconButton>
      </M3DialogTitle>

      <M3DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <M3TextField
          fullWidth
          label="To"
          variant="outlined"
          size="small"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="recipient@example.com"
        />

        <M3TextField
          fullWidth
          label="Subject"
          variant="outlined"
          size="small"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject"
        />

        <M3TextField
          fullWidth
          label="Message"
          variant="outlined"
          multiline
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type your message here..."
        />
      </M3DialogContent>

      <M3DialogActions sx={{ p: 2, gap: 1 }}>
        <M3Button onClick={onClose} variant="outlined">
          Cancel
        </M3Button>
        <M3Button
          onClick={handleSend}
          variant="filled"
          startIcon={<Send />}
          sx={{ bgcolor: 'primary.main', color: 'white' }}
        >
          Send
        </M3Button>
      </M3DialogActions>
    </M3Dialog>
  );
};
