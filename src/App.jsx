import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// Components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import TradingDashboard from './components/trading/TradingDashboard';
import AssetAnalysis from './components/trading/AssetAnalysis';
import NewsSentiment from './components/trading/NewsSentiment';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c',
    },
  },
});

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: 240, // Width of the sidebar
  marginTop: 64, // Height of the header
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.background.default,
}));

function App() {
  const [selectedAsset, setSelectedAsset] = useState('EUR/USD');
  const [timeframe, setTimeframe] = useState('1h');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Header />
        <Sidebar 
          selectedAsset={selectedAsset}
          onAssetSelect={setSelectedAsset}
          timeframe={timeframe}
          onTimeframeSelect={setTimeframe}
        />
        <MainContent>
          <TradingDashboard 
            selectedAsset={selectedAsset}
            timeframe={timeframe}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
            <AssetAnalysis 
              asset={selectedAsset}
              timeframe={timeframe}
            />
            <NewsSentiment 
              asset={selectedAsset}
            />
          </Box>
        </MainContent>
      </Box>
    </ThemeProvider>
  );
}

export default App;