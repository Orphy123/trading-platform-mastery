import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box,
  Button,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';

const Header = ({ onThemeToggle, isDarkMode }) => {
  const theme = useTheme();

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        background: 'linear-gradient(90deg, #1a237e 0%, #0d47a1 100%)'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          TradeMaster
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button 
            variant="contained" 
            color="secondary"
            sx={{ 
              background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
              }
            }}
          >
            Start Trading
          </Button>

          <IconButton color="inherit" onClick={onThemeToggle}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>

          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 