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
} from '@mui/material';
import {
  ShowChart as ChartIcon,
  Timeline as TimelineIcon,
  Assessment as AnalysisIcon,
  Article as NewsIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const assets = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'AUD/USD',
  'USD/CAD',
  'US100',
  'US30',
  'Crude Oil WTI',
];

const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

const Sidebar = ({ selectedAsset, onAssetSelect, timeframe, onTimeframeChange }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: 8,
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem>
            <ListItemText primary="Assets" />
          </ListItem>
          {assets.map((asset) => (
            <ListItemButton
              key={asset}
              selected={selectedAsset === asset}
              onClick={() => onAssetSelect(asset)}
            >
              <ListItemIcon>
                <ChartIcon />
              </ListItemIcon>
              <ListItemText primary={asset} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem>
            <ListItemText primary="Timeframes" />
          </ListItem>
          {timeframes.map((tf) => (
            <ListItemButton
              key={tf}
              selected={timeframe === tf}
              onClick={() => onTimeframeChange(tf)}
            >
              <ListItemIcon>
                <TimelineIcon />
              </ListItemIcon>
              <ListItemText primary={tf} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem>
            <ListItemText primary="Analysis" />
          </ListItem>
          <ListItemButton>
            <ListItemIcon>
              <AnalysisIcon />
            </ListItemIcon>
            <ListItemText primary="Technical Analysis" />
          </ListItemButton>
          <ListItemButton>
            <ListItemIcon>
              <NewsIcon />
            </ListItemIcon>
            <ListItemText primary="News Sentiment" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 