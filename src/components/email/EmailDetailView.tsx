import React from 'react';
import { M3Box, M3Typography, M3IconButton, M3Divider } from 'm3r';
import { ArrowBack, Delete, Archive, MoreVert } from '@mui/icons-material';
import type { Email } from '../../types';

interface EmailDetailViewProps {
  email: Email | null;
  onBack: () => void;
}

export const EmailDetailView: React.FC<EmailDetailViewProps> = ({ email, onBack }) => {
  if (!email) {
    return (
      <M3Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
        <M3Typography>Select an email to read</M3Typography>
      </M3Box>
    );
  }

  const getDateFormatted = (dateInput: Date | string) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <M3Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white', overflowY: 'auto' }}>
      {/* Header */}
      <M3Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}>
        <M3Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <M3IconButton onClick={onBack}>
            <ArrowBack />
          </M3IconButton>
          <M3Box sx={{ display: 'flex', gap: 1 }}>
            <M3IconButton>
              <Archive />
            </M3IconButton>
            <M3IconButton>
              <Delete />
            </M3IconButton>
            <M3IconButton>
              <MoreVert />
            </M3IconButton>
          </M3Box>
        </M3Box>

        {/* Subject */}
        {/* @ts-ignore */}
        <M3Typography variant="headline" sx={{ fontWeight: 600, mb: 2 }}>
          {email.subject}
        </M3Typography>

        {/* From & Date */}
        <M3Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={email.avatar} alt={email.sender} style={{ width: 40, height: 40, borderRadius: '50%' }} />
          <M3Box>
            {/* @ts-ignore */}
            <M3Typography variant="body" sx={{ fontWeight: 600 }}>
              {email.sender}
            </M3Typography>
            {/* @ts-ignore */}
            <M3Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {email.senderEmail}
            </M3Typography>
          </M3Box>
          <M3Box sx={{ ml: 'auto' }}>
            {/* @ts-ignore */}
            <M3Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {getDateFormatted(email.date)}
            </M3Typography>
          </M3Box>
        </M3Box>
      </M3Box>

      {/* Email Body */}
      <M3Box sx={{ p: 3, flexGrow: 1 }}>
        <M3Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'text.primary' }}>
          {email.body || email.snippet}
        </M3Typography>
      </M3Box>

      {/* Reply Section (Optional) */}
      <M3Divider />
      <M3Box sx={{ p: 3, bgcolor: '#F5F5F5' }}>
        {/* @ts-ignore */}
        <M3Typography variant="body" sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}>
          ↳ Reply
        </M3Typography>
      </M3Box>
    </M3Box>
  );
};
