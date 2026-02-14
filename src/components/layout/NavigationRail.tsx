import React, { useState } from 'react';
import { Box, IconButton, Badge, Avatar, Stack, Typography } from '@mui/material';
import {
  Mail, CalendarToday, People, Notifications, WbSunny,
  ColorLens, Settings, Edit
} from '@mui/icons-material';

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <Box onClick={onClick} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', mb: 3, opacity: isActive ? 1 : 0.6 }}>
    <Box sx={{
      bgcolor: isActive ? 'primary.light' : 'transparent',
      p: 1, borderRadius: 4, width: 48, height: 32,
      display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 0.5
    }}>
      {icon}
    </Box>
    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>{label}</Typography>
  </Box>
);

export const NavigationRail = () => {
  const [activeTab, setActiveTab] = useState('email');

  return (
    <Box sx={{
      width: 80, height: '100vh', bgcolor: 'background.paper',
      display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2,
      borderRight: '1px solid #E0E0E0'
    }}>
      <IconButton sx={{ bgcolor: '#D0BCFF', color: '#381E72', mb: 4, width: 48, height: 48 }}>
        <Edit />
      </IconButton>

      <NavItem icon={<Mail sx={{ color: '#1D192B' }} />} label="Email" isActive={activeTab === 'email'} onClick={() => setActiveTab('email')} />
      <NavItem icon={<CalendarToday sx={{ color: '#1D192B' }} />} label="Calendar" isActive={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
      <NavItem icon={<People sx={{ color: '#1D192B' }} />} label="Contacts" isActive={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />

      <Box sx={{ flexGrow: 1 }} />

      <Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Badge badgeContent={25} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
          <Notifications sx={{ color: 'text.secondary' }} />
        </Badge>
        <WbSunny sx={{ color: 'text.secondary' }} />
        <ColorLens sx={{ color: 'text.secondary' }} />
        <Settings sx={{ color: 'text.secondary' }} />
        <Avatar src="https://i.pravatar.cc/150?u=me" sx={{ width: 40, height: 40, mt: 1, border: '2px solid white' }} />
      </Stack>
    </Box>
  );
};