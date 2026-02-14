import { useState } from 'react';
import { M3Box, M3Typography, M3Stack, M3Chip, M3List, M3Divider } from 'm3r';
import { Menu, Refresh, MoreVert } from '@mui/icons-material';
import { EmailItem } from './EmailItem';
import { mockEmails } from '../../data/mockEmails';

export const EmailListPanel = () => {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [filter, setFilter] = useState('All');

  return (
    <M3Box sx={{ width: 380, height: '100vh', bgcolor: '#FDFCFE', display: 'flex', flexDirection: 'column', borderRight: '1px solid #E7E0EC' }}>
      {/* Header */}
      <M3Box sx={{ p: 2 }}>
        <M3Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
           {/* @ts-ignore */}
           <M3Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: -1 }}>
             nano<span style={{ fontWeight: 300 }}>V</span>OLTZ
           </M3Typography>
        </M3Box>
        
        {/* Account Selector */}
        <M3Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 2, px: 1.5, py: 0.5, mb: 3 }}>
          {/* @ts-ignore */}
          <M3Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>(Sam Jones) sam.jones@...</M3Typography>
          <MoreVert fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
        </M3Box>

        {/* Toolbar */}
        <M3Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <M3Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Menu />
            <Refresh />
            {/* @ts-ignore */}
            <M3Typography variant="h6" sx={{ ml: 1 }}>Inbox (4)</M3Typography>
          </M3Box>
        </M3Box>

        {/* Filters */}
        <M3Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {['All', 'Read', 'Today', 'Unread'].map((label) => {
            return <M3Chip
              key={label}
              label={label}
              onClick={() => setFilter(label)}
              variant={filter === label ? ('filled' as any) : ('outlined' as any)}
              size="small"
              sx={{ bgcolor: filter === label ? 'primary.light' : 'transparent', height: 32 }}
            />;
          })}
        </M3Stack>
      </M3Box>
      <M3Divider />
      
      {/* List */}
      <M3List sx={{ overflowY: 'auto', flexGrow: 1, p: 0 }}>
        {mockEmails.map((email) => (
          <EmailItem 
            key={email.id} 
            email={email} 
            isSelected={selectedId === email.id} 
            onClick={setSelectedId} 
          />
        ))}
      </M3List>
    </M3Box>
  );
};