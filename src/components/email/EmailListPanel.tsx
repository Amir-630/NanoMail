import { useState } from 'react';
import { Box, Typography, Stack, Chip, List, Divider } from '@mui/material';
import { Menu, Refresh, MoreVert } from '@mui/icons-material';
import { EmailItem } from './EmailItem';
import { mockEmails } from '../../data/mockEmails';

export const EmailListPanel = () => {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [filter, setFilter] = useState('All');

  return (
    <Box sx={{ width: 380, height: '100vh', bgcolor: '#FDFCFE', display: 'flex', flexDirection: 'column', borderRight: '1px solid #E7E0EC' }}>
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
           <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: -1 }}>
             nano<span style={{ fontWeight: 300 }}>V</span>OLTZ
           </Typography>
        </Box>
        
        {/* Account Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 2, px: 1.5, py: 0.5, mb: 3 }}>
          <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>(Sam Jones) sam.jones@...</Typography>
          <MoreVert fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
        </Box>

        {/* Toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Menu />
            <Refresh />
            <Typography variant="h6" sx={{ ml: 1 }}>Inbox (4)</Typography>
          </Box>
        </Box>

        {/* Filters */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {['All', 'Read', 'Today', 'Unread'].map((label) => (
            <Chip
              key={label}
              label={label}
              onClick={() => setFilter(label)}
              variant={filter === label ? 'filled' : 'outlined'}
              size="small"
              sx={{ bgcolor: filter === label ? 'primary.light' : 'transparent', height: 32 }}
            />
          ))}
        </Stack>
      </Box>
      <Divider />
      
      {/* List */}
      <List sx={{ overflowY: 'auto', flexGrow: 1, p: 0 }}>
        {mockEmails.map((email) => (
          <EmailItem 
            key={email.id} 
            email={email} 
            isSelected={selectedId === email.id} 
            onClick={setSelectedId} 
          />
        ))}
      </List>
    </Box>
  );
};