import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShowChart as ChartIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Newspaper as NewsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = ({ selectedAsset, onAssetSelect, timeframe, onTimeframeChange }) => {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon /> },
    { text: 'Trading', icon: <ChartIcon /> },
    { text: 'Analysis', icon: <TrendingUpIcon /> },
    { text: 'Reports', icon: <AssessmentIcon /> },
    { text: 'News', icon: <NewsIcon /> },
    { text: 'Settings', icon: <SettingsIcon /> },
  ];

  const assets = [
    'EUR/USD',
    'GBP/USD',
    'USD/JPY',
    'US100',
    'US30',
    'Crude Oil WTI'
  ];

  const timeframes = [
    '1m', '5m', '15m', '30m', '1h', '4h', '1d'
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1a237e 0%, #0d47a1 100%)',
          color: 'white',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
            Asset
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Select
              value={selectedAsset}
              onChange={(e) => onAssetSelect(e.target.value)}
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
              }}
            >
              {assets.map((asset) => (
                <MenuItem key={asset} value={asset}>{asset}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)' }}>
            Timeframe
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={timeframe}
              onChange={(e) => onTimeframeChange(e.target.value)}
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
              }}
            >
              {timeframes.map((tf) => (
                <MenuItem key={tf} value={tf}>{tf}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 