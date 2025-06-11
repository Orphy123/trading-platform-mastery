// src/components/common/Header.jsx
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Header = () => {
  return (
    <StyledAppBar position="fixed" elevation={0}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Trading Assistant
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="inherit" aria-label="notifications">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit" aria-label="settings">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;