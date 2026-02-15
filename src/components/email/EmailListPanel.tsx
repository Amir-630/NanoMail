import { useState, useMemo } from 'react';
import { M3Box, M3Typography, M3Stack, M3Chip, M3List, M3Divider } from 'm3r';
import { Menu, Refresh, MoreVert } from '@mui/icons-material';
import { EmailItem } from './EmailItem';
import { mockEmails } from '../../data/mockEmails';
import type { Email } from '../../types';

interface EmailListPanelProps {
  onSelectEmail: (id: number, allEmails: Email[]) => void;
  searchQuery: string;
  filterType: string;
  onFilterChange: (filter: string) => void;
  newEmails: Email[];
}

export const EmailListPanel: React.FC<EmailListPanelProps> = ({
  onSelectEmail,
  searchQuery,
  filterType,
  onFilterChange,
  newEmails
}) => {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [currentFolder, setCurrentFolder] = useState('inbox');

  // Combine mock and new emails
  const allEmails = useMemo(() => [...mockEmails, ...newEmails], [newEmails]);

  // Filter emails by folder/category and apply search + filters
  const filteredEmails = useMemo(() => {
    let result = allEmails.filter(email => email.category === currentFolder);

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(email =>
        email.subject.toLowerCase().includes(query) ||
        email.sender.toLowerCase().includes(query) ||
        email.snippet.toLowerCase().includes(query) ||
        email.body?.toLowerCase().includes(query)
      );
    }

    // Apply filter type
    if (filterType === 'Read') {
      result = result.filter(email => email.read);
    } else if (filterType === 'Unread') {
      result = result.filter(email => !email.read);
    } else if (filterType === 'Today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter(email => {
        const emailDate = typeof email.date === 'string' ? new Date(email.date) : email.date;
        emailDate.setHours(0, 0, 0, 0);
        return emailDate.getTime() === today.getTime();
      });
    }
    // 'All' shows all filtered emails

    return result;
  }, [allEmails, searchQuery, filterType, currentFolder]);

  const handleEmailClick = (id: number) => {
    setSelectedId(id);
    onSelectEmail(id, filteredEmails);
  };

  const inboxCount = allEmails.filter(e => e.category === 'inbox').length;
  const sentCount = allEmails.filter(e => e.category === 'sent').length;

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
            <M3Typography variant="h6" sx={{ ml: 1 }}>
              {currentFolder === 'inbox' ? `Inbox (${inboxCount})` : `Sent (${sentCount})`}
            </M3Typography>
          </M3Box>
        </M3Box>

        {/* Filters */}
        <M3Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {['All', 'Read', 'Today', 'Unread'].map((label) => (
            <M3Chip
              key={label}
              label={label}
              onClick={() => onFilterChange(label)}
              variant={filterType === label ? ('filled' as any) : ('outlined' as any)}
              size="small"
              sx={{ bgcolor: filterType === label ? 'primary.light' : 'transparent', height: 32 }}
            />
          ))}
        </M3Stack>

        {/* Folder Tabs */}
        <M3Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <M3Chip
            label={`Inbox (${inboxCount})`}
            onClick={() => setCurrentFolder('inbox')}
            variant={currentFolder === 'inbox' ? ('filled' as any) : ('outlined' as any)}
            size="small"
            sx={{ bgcolor: currentFolder === 'inbox' ? 'primary.light' : 'transparent', height: 32, flex: 1 }}
          />
          <M3Chip
            label={`Sent (${sentCount})`}
            onClick={() => setCurrentFolder('sent')}
            variant={currentFolder === 'sent' ? ('filled' as any) : ('outlined' as any)}
            size="small"
            sx={{ bgcolor: currentFolder === 'sent' ? 'primary.light' : 'transparent', height: 32, flex: 1 }}
          />
        </M3Stack>
      </M3Box>
      <M3Divider />

      {/* List */}
      <M3List sx={{ overflowY: 'auto', flexGrow: 1, p: 0 }}>
        {filteredEmails.length > 0 ? (
          filteredEmails.map((email) => (
            <EmailItem
              key={email.id}
              email={email}
              isSelected={selectedId === email.id}
              onClick={handleEmailClick}
            />
          ))
        ) : (
          <M3Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
            <M3Typography>No emails found</M3Typography>
          </M3Box>
        )}
      </M3List>
    </M3Box>
  );
};
