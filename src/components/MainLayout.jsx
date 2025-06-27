import { useState } from 'react';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


import { AppBar, Toolbar, Typography, Box, Button, Menu, MenuItem, IconButton, Container, Tabs, Tab } from '@mui/material';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LogoutIcon from '@mui/icons-material/Logout';

//comp
import MainNav from './MainNav';

const MainLayout = () => {
  
  const { user, logout, refreshUser } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const pages = user?.pages;
  const userData = user?.userData || {};
  
  return (
    <>
      <AppBar position="static" color="dark" sx={{margin: 0}}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo i nawigacja */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" component={RouterLink} to="/" color="inherit" sx={{ textDecoration: 'none' }}>
              DataStack
            </Typography>
            <MainNav pages={pages}/>
          </Box>

          {/* Użytkownik */}
          <Box>
            <IconButton size="large" color="inherit" onClick={handleMenuOpen}>
              <AccountBoxIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              
              <MenuItem disabled title="tu kiedyś link do strony użytkownika">{userData.name} {userData.last_name}</MenuItem>
              <MenuItem disabled title="email">{userData.email}</MenuItem>
              <MenuItem disabled title="rola">{userData.role}</MenuItem>
              <MenuItem disabled title="ostatnie logowanie">{userData.last_login_at}</MenuItem>
              <MenuItem title="Odśwież dane użytkownika" onClick={refreshUser}>Odśwież dane i dostępy użytkownika</MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Wyloguj się
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Główna treść aplikacji */}
      <Box>
        <Outlet />
      </Box>
    </>
  );
};

export default MainLayout;
