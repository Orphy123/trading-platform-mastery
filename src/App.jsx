import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import TradingDashboard from './components/trading/TradingDashboard';
import NewsSentiment from './components/trading/NewsSentiment';

const App = () => {
  const [selectedAsset, setSelectedAsset] = useState('EUR/USD');
  const [timeframe, setTimeframe] = useState('1h');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#1a237e',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: isDarkMode ? '#121212' : '#f5f5f5',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDarkMode 
              ? '0 4px 6px rgba(0, 0, 0, 0.1)'
              : '0 4px 6px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
    },
  });

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Header onThemeToggle={handleThemeToggle} isDarkMode={isDarkMode} />
        <Sidebar 
          selectedAsset={selectedAsset}
          onAssetSelect={setSelectedAsset}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <TradingDashboard 
            selectedAsset={selectedAsset} 
            timeframe={timeframe} 
          />
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <NewsSentiment selectedAsset={selectedAsset} />
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;