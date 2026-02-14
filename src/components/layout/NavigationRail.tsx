import React, { useState } from 'react';
import { M3Box, M3IconButton, M3Badge, M3Avatar, M3Stack, M3Typography } from 'm3r';
import {
  Mail, CalendarToday, People, Notifications, WbSunny,
  ColorLens, Settings, Edit
} from '@mui/icons-material';

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <M3Box onClick={onClick} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', mb: 3, opacity: isActive ? 1 : 0.6 }}>
    <M3Box sx={{
      bgcolor: isActive ? 'primary.light' : 'transparent',
      p: 1, borderRadius: 4, width: 48, height: 32,
      display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 0.5
    }}>
      {icon}
    </M3Box>
    {/* @ts-ignore */}
    <M3Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>{label}</M3Typography>
  </M3Box>
);

export const NavigationRail = () => {
  const [activeTab, setActiveTab] = useState('email');

  return (
    <M3Box sx={{
      width: 80, height: '100vh', bgcolor: 'background.paper',
      display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2,
      borderRight: '1px solid #E0E0E0'
    }}>
      <M3IconButton sx={{ bgcolor: '#D0BCFF', color: '#381E72', mb: 4, width: 48, height: 48 }}>
        <Edit />
      </M3IconButton>

      <NavItem icon={<Mail sx={{ color: '#1D192B' }} />} label="Email" isActive={activeTab === 'email'} onClick={() => setActiveTab('email')} />
      <NavItem icon={<CalendarToday sx={{ color: '#1D192B' }} />} label="Calendar" isActive={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
      <NavItem icon={<People sx={{ color: '#1D192B' }} />} label="Contacts" isActive={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />

      <M3Box sx={{ flexGrow: 1 }} />

      <M3Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <M3Badge badgeContent={25} color="error" sx={{ '& .M3Badge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
          <Notifications sx={{ color: 'text.secondary' }} />
        </M3Badge>
        <WbSunny sx={{ color: 'text.secondary' }} />
        <ColorLens sx={{ color: 'text.secondary' }} />
        <Settings sx={{ color: 'text.secondary' }} />
        <M3Avatar src="https://i.pravatar.cc/150?u=me" sx={{ width: 40, height: 40, mt: 1, border: '2px solid white' }} />
      </M3Stack>
    </M3Box>
  );
};