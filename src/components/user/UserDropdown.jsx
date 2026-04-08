import { useState } from 'react';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRwd } from '../../context/RwdContext';


import { AppBar, Toolbar, Typography, Box, Button, Menu, MenuItem, IconButton, Container, Tabs, Tab, Chip } from '@mui/material';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import UserAvatarIcon from './UserAvatarIcon.jsx';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import AppVersion from './AppVersion';


const UserDropdown = () => {
    const { user, logout, refreshUser } = useAuth();

    const [anchorEl, setAnchorEl] = useState(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const pages = user?.pages;
    const processes = user?.processes;
    const userData = user?.userData || {};

    console.log(user);
    return (
        <Box>
            <IconButton size="large" color="inherit" onClick={handleMenuOpen}>
                <UserAvatarIcon size={36} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>

                <Box sx={{ px: 2, py: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <AppVersion />
                    <Typography variant="subtitle1">
                        {userData.name} {userData.last_name} 
                        <Chip label={userData.role} size="small" variant="outlined" color="default" sx={{ ml: 1 }} />
                    </Typography>        
                    
                    {processes && processes.length > 0 && (
                        <Button
                            component={RouterLink}
                            to="/userlogform"
                            startIcon={<AccessAlarmIcon />}
                            variant="text"
                            color='default'
                            size="small"
                            sx={{ mt: 1 }}
                            onClick={handleMenuClose}
                        >
                            Logi użytkownika
                        </Button>
                    )}

                    <Button
                        component={RouterLink}
                        to="/userdashboard"
                        startIcon={<DashboardIcon />}
                        variant="text"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={handleMenuClose}
                    >
                        Panel użytkownika
                    </Button>
                    <Button
                        variant="text"
                        size="small"
                        startIcon={<RefreshIcon />}
                        color={'warning'}
                        sx={{ mt: 1 }}
                        onClick={refreshUser}
                    >
                       Odśwież dane i dostępy
                    </Button>
                    <Button
                        variant="text"
                        size="small"
                        startIcon={<LogoutIcon />}
                        color={'error'}
                        sx={{ mt: 1 }}
                        onClick={handleLogout}
                    >
                       Wyloguj się
                    </Button>
                </Box>
            </Menu>
        </Box>
    )
}

export default UserDropdown;