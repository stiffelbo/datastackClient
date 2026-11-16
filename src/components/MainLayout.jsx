
import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Box } from '@mui/material';

import { useAuth } from '../context/AuthContext';

import MainNav from './MainNav';
import UserDropdown from './user/UserDropdown';
import BoardLink from '../pages/board/BoardLink';

import Logo from '../assets/logoDSsmall.svg';

const MainLayout = () => {
    const { user } = useAuth();
    const pages = user?.pages ?? [];

    return (
        <>
            <AppBar position="static" color="dark" sx={{ width: '100%', maxWidth: '100%' }}>
                <Toolbar sx={{ display: 'flex', gap: 1, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                    <Box component={RouterLink} to="/" title="Strona domowa" sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <Box component="img" src={Logo} alt="DataStack" sx={{ height: 36 }} />
                    </Box>

                    <Box sx={{ flexShrink: 0 }}>
                        <BoardLink />
                    </Box>

                    <Box sx={{ flex: '1 1 0%', minWidth: 0, overflow: 'hidden' }}>
                        <MainNav pages={pages} />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <UserDropdown />
                    </Box>
                </Toolbar>
            </AppBar>

            <Box sx={{ width: '100%', minWidth: 0 }}>
                <Outlet />
            </Box>
        </>
    );
};

export default MainLayout;
