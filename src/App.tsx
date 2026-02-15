import { useState } from 'react';
import { NavigationRail } from './components/layout/NavigationRail';
import { EmailListPanel } from './components/email/EmailListPanel';
import { GlobalSearch } from './components/common/GlobalSearch';
import { EmailDetailView } from './components/email/EmailDetailView';
import { ComposeEmail } from './components/email/ComposeEmail';
import { M3Box } from 'm3r';
import type { Email } from './types';

function App() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  const handleSelectEmail = (id: number, allEmails: Email[]) => {
    const email = allEmails.find(e => e.id === id);
    if (email) {
      setSelectedEmail(email);
    }
  };

  const handleSendEmail = (newEmail: Email) => {
    setEmails([...emails, newEmail]);
  };

  const handleComposeClick = () => {
    setComposeOpen(true);
  };

  return (
    <M3Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      {/* Section 1: Navigation */}
      <NavigationRail onComposeClick={handleComposeClick} />
      
      {/* Section 2: List View */}
      <EmailListPanel 
        onSelectEmail={handleSelectEmail}
        searchQuery={searchQuery}
        filterType={filterType}
        onFilterChange={setFilterType}
        newEmails={emails}
      />
      
      {/* Section 3: Main Content Area */}
      <M3Box sx={{ flexGrow: 1, height: '100vh', bgcolor: 'white', display: 'flex', flexDirection: 'column' }}>
        <M3Box sx={{ p: 2, display: 'flex', justifyContent: 'center', bgcolor: '#FDFCFE' }}>
          <GlobalSearch onSearch={setSearchQuery} />
        </M3Box>
        
        {/* Email Detail View */}
        <EmailDetailView 
          email={selectedEmail} 
          onBack={() => {
            setSelectedEmail(null);
          }}
        />
      </M3Box>

      {/* Compose Email Dialog */}
      <ComposeEmail 
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSend={handleSendEmail}
      />
      
    </M3Box>
  );
}

export default App;