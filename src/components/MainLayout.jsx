import { useState } from 'react';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRwd } from '../context/RwdContext';


import { AppBar, Toolbar, Typography, Box, Button, Menu, MenuItem, IconButton, Container, Tabs, Tab } from '@mui/material';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LogoutIcon from '@mui/icons-material/Logout';

//comp
import MainNav from './MainNav';
// logo do paska
import Logo from '../assets/logoDS.svg';

// src/components/UserAvatarIcon.jsx
const UserAvatarIcon = ({ size = 30, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {/* tło w kółku */}
    <circle cx="16" cy="16" r="15" fill="#ffffffff" />

    {/* głowa */}
    <circle cx="16" cy="11" r="4.2" fill="#b3b3b3ff" />

    {/* lekki cień pod głową */}
    <ellipse cx="16" cy="14.8" rx="4.6" ry="1.6" fill="rgba(15,23,42,0.45)" />

    {/* sweterek / ramiona w gradientzie z loga */}
    <defs>
      <linearGradient id="ds-body" x1="8" y1="18" x2="24" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#2563EB" />
        <stop offset="0.5" stopColor="#1D4ED8" />
        <stop offset="1" stopColor="#0F766E" />
      </linearGradient>
    </defs>

    <path
      d="
        M8 24
        C8 20.7 10.7 18 14 18
        H18
        C21.3 18 24 20.7 24 24
        V25
        C24 25.55 23.55 26 23 26
        H9
        C8.45 26 8 25.55 8 25
        Z
      "
      fill="url(#ds-body)"
    />

    {/* delikatny obrys, żeby było bardziej „ikonowe” */}
    <circle
      cx="16"
      cy="16"
      r="15"
      fill="none"
      stroke="rgba(63, 63, 63, 0.4)"
      strokeWidth="0.4"
    />
  </svg>
);

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
            <Box
              component="img"
              src={Logo}
              alt="DataStack logo"
            />
            <MainNav pages={pages}/>
          </Box>

          {/* Użytkownik */}
          <Box>
            <IconButton size="large" color="inherit" onClick={handleMenuOpen}>
              <UserAvatarIcon size={36}/>
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
