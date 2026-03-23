'use client';

import React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from '@/store';
import theme from '@/theme/theme';
import GlobalNotification from '@/components/GlobalNotification';

export function Providers({ children }: { children: React.ReactNode }) {
  // We use a state check as a secondary fallback to prevent aggressive hydration mismatches
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <Provider store={store}>
        {mounted && (
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalNotification />
            {children}
          </ThemeProvider>
        )}
      </Provider>
    </AppRouterCacheProvider>
  );
}
