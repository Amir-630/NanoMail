import React from 'react';
import { M3ListItem, M3ListItemAvatar, M3Avatar, M3ListItemText, M3Typography, M3Box } from 'm3r';
import type { Email } from '../../types';

interface EmailItemProps {
  email: Email;
  isSelected: boolean;
  onClick: (id: number) => void;
}

export const EmailItem: React.FC<EmailItemProps> = ({ email, isSelected, onClick }) => {
  return (
    <M3ListItem
      alignItems="flex-start"
      onClick={() => onClick(email.id)}
      sx={{
        cursor: 'pointer',
        bgcolor: isSelected ? 'background.paper' : 'transparent',
        '&:hover': { bgcolor: '#F7F2FA' },
        py: 2,
        borderBottom: '1px solid #E0E0E0'
      }}
    >
      <M3ListItemAvatar>
        <M3Avatar src={email.avatar} alt={email.sender} />
      </M3ListItemAvatar>
      <M3ListItemText
        primary={
          <M3Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* @ts-ignore */}
            <M3Typography variant="subtitle1" sx={{ color: 'text.primary' }}>{email.sender}</M3Typography>
            <M3Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* @ts-ignore */}
              <M3Typography variant="caption" sx={{ fontWeight: 500 }}>{email.time}</M3Typography>
              {email.unreadCount && (
                <M3Box sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                  {email.unreadCount}
                </M3Box>
              )}
            </M3Box>
          </M3Box>
        }
        secondary={
          <M3Box component="span">
            {/* @ts-ignore */}
            <M3Typography component="span" variant="body2" sx={{ display: 'block', fontWeight: !email.read ? 600 : 400, color: 'text.primary' }}>
              {email.subject}
            </M3Typography>
            {/* @ts-ignore */}
            <M3Typography component="span" variant="body2" sx={{ display: 'block', color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {email.snippet}
            </M3Typography>
          </M3Box>
        }
      />
    </M3ListItem>
  );
};