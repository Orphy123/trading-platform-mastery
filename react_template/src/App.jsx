import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import TradingDashboard from './components/trading/TradingDashboard';
import AssetAnalysis from './components/trading/AssetAnalysis';
import NewsSentiment from './components/trading/NewsSentiment';
import { startMockServer } from './mockServer';

// Start mock server in development
if (process.env.NODE_ENV === 'development') {
  startMockServer();
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  const [selectedAsset, setSelectedAsset] = useState('EUR/USD');
  const [timeframe, setTimeframe] = useState('1h');

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Header />
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
            gap: 2,
          }}
        >
          <TradingDashboard selectedAsset={selectedAsset} timeframe={timeframe} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <AssetAnalysis selectedAsset={selectedAsset} timeframe={timeframe} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <NewsSentiment selectedAsset={selectedAsset} />
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;