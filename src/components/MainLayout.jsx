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
import Logo from '../assets/logoDSsmall.svg';

import UserDropdown from './user/UserDropdown';

const MainLayout = () => {

  const { user } = useAuth();

  const pages = user?.pages;


  return (
    <>
      <AppBar position="static" color="dark" sx={{ margin: 0 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo i nawigacja */}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component={RouterLink}
              to="//"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
              title='Strona domowa'
            >
              <Box
                component="img"
                src={Logo}
                alt="DataStack logo"
                sx={{ height: 36 }}
                
              />
            </Box>
            <MainNav pages={pages} />
          </Box>

          {/* Użytkownik */}
          <UserDropdown />
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
