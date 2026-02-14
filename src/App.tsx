import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { m3Theme } from './theme/m3Theme';
import { NavigationRail } from './components/layout/NavigationRail';
import { EmailListPanel } from './components/email/EmailListPanel';
import { GlobalSearch } from './components/common/GlobalSearch';

function App() {
  return (
    <ThemeProvider theme={m3Theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        
        {/* Section 1: Navigation */}
        <NavigationRail />
        
        {/* Section 2: List View */}
        <EmailListPanel />
        
        {/* Section 3: Main Content Area */}
        <Box sx={{ flexGrow: 1, height: '100vh', bgcolor: 'white', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', bgcolor: '#FDFCFE' }}>
            <GlobalSearch />
          </Box>
          
          {/* Detailed View / Outlet would go here */}
          <Box sx={{ flexGrow: 1, bgcolor: 'white' }}>
             {/* Future: <EmailDetailView /> */}
          </Box>
        </Box>
        
      </Box>
    </ThemeProvider>
  );
}

export default App;