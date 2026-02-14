import { createTheme } from '@mui/material';

export const m3Theme = createTheme({
  palette: {
    primary: {
      main: '#6750A4', // M3 Purple
      light: '#E8DEF8', // Surface Container High (Active State)
    },
    background: {
      default: '#FFFBFE',
      paper: '#F3F0FC', // Sidebar specific background
    },
    text: {
      primary: '#1C1B1F',
      secondary: '#49454F',
    },
    action: {
      hover: 'rgba(103, 80, 164, 0.08)',
    },
  },
  shape: {
    borderRadius: 12, // Standard M3 corner radius
  },
  typography: {
    fontFamily: '"Roboto", "Inter", sans-serif',
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600, fontSize: '0.95rem' },
    body2: { fontSize: '0.85rem', color: '#49454F' },
    caption: { color: '#6e6a71' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 20, textTransform: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
        filled: { backgroundColor: '#E8DEF8' },
      },
    },
  },
});