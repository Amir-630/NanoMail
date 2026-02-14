import React from 'react';
import { ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box } from '@mui/material';
import type { Email } from '../../types';

interface EmailItemProps {
  email: Email;
  isSelected: boolean;
  onClick: (id: number) => void;
}

export const EmailItem: React.FC<EmailItemProps> = ({ email, isSelected, onClick }) => {
  return (
    <ListItem
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
      <ListItemAvatar>
        <Avatar src={email.avatar} alt={email.sender} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>{email.sender}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>{email.time}</Typography>
              {email.unreadCount && (
                <Box sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                  {email.unreadCount}
                </Box>
              )}
            </Box>
          </Box>
        }
        secondary={
          <Box component="span">
            <Typography component="span" variant="body2" sx={{ display: 'block', fontWeight: !email.read ? 600 : 400, color: 'text.primary' }}>
              {email.subject}
            </Typography>
            <Typography component="span" variant="body2" sx={{ display: 'block', color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {email.snippet}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
};