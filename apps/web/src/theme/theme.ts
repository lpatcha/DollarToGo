'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00D084', // DollarToGo Green
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6366F1', // Indigo/Secondary
    },
    background: {
      default: '#F8FAFC', // Very light slate
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B', // Dark slate text
      secondary: '#64748B', // Muted slate text
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 20px rgba(0, 208, 132, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme;
