
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box, Tabs, Tab, Menu, MenuItem, Drawer,
    Typography, IconButton, useMediaQuery, useTheme, Tooltip
} from '@mui/material';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { useNav } from '../context/NavContext';

const isExternal = (route) => /^https?:\/\//i.test(String(route ?? ''));

const MainNav = ({ pages = [] }) => {
    const { page } = useNav();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [anchorEl, setAnchorEl] = useState(null);
    const [openGroup, setOpenGroup] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const internalPages = pages.filter((p) => !isExternal(p.route));
    const externalPages = pages.filter((p) => isExternal(p.route));

    const groupedPages = internalPages.reduce((acc, p) => {
        const group = p.group || 'Pozostałe';
        if (!acc[group]) acc[group] = [];
        acc[group].push(p);
        return acc;
    }, {});

    if (externalPages.length) groupedPages['Strony zewnętrzne'] = externalPages;

    const groups = Object.entries(groupedPages).map(([name, items]) => ({
        name,
        items,
        active: items.some((p) => !isExternal(p.route) && p.name === page),
    }));

    const activeIndex = groups.findIndex((group) => group.active);
    const selectedTab = activeIndex >= 0 ? activeIndex : false;
    const activeGroup = groups.find((group) => group.name === openGroup);

    const handleOpen = (event, group) => {
        setAnchorEl(event.currentTarget);
        setOpenGroup(group);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setOpenGroup(null);
    };

    const handleMobileClose = () => setMobileOpen(false);


    const renderMenuItem = (p, onClick) => {
        const external = isExternal(p.route);

        return (
            <Tooltip key={p.name} title={p.description || ''} placement="right" arrow enterDelay={400}>
                <MenuItem
                    component={external ? 'a' : RouterLink}
                    {...(external ? {
                        href: p.route,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                    } : {
                        to: p.route,
                        selected: p.name === page,
                    })}
                    onClick={onClick}
                    sx={{ fontSize: '0.85rem', gap: 1 }}
                >
                    {p.label}
                    {external && <OpenInNewIcon sx={{ fontSize: 14, ml: 'auto', opacity: 0.5 }} />}
                </MenuItem>
            </Tooltip>
        );
    };

    const renderTab = (group, index) => {
        const single = group.items.length === 1;
        const item = single ? group.items[0] : null;
        const external = single && isExternal(item.route);

        return (
            <Tab
                key={group.name}
                value={index}
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {single ? item.label : group.name}
                        {!single && <ArrowDropDownIcon sx={{ fontSize: 17 }} />}
                        {external && <OpenInNewIcon sx={{ fontSize: 13, opacity: 0.6 }} />}
                    </Box>
                }
                {...(single ? (
                    external ? {
                        component: 'a',
                        href: item.route,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                    } : {
                        component: RouterLink,
                        to: item.route,
                    }
                ) : {
                    onClick: (event) => handleOpen(event, group.name),
                    'aria-haspopup': 'menu',
                    'aria-expanded': openGroup === group.name ? 'true' : undefined,
                })}
                sx={{
                    minWidth: 'auto',
                    minHeight: 40,
                    px: 1.5,
                    fontSize: '0.8rem',
                    fontWeight: group.active ? 700 : 500,
                    textTransform: 'none',
                    color: group.active ? 'primary.main' : 'inherit',
                    opacity: group.active ? 1 : 0.8,
                    '&:hover': { opacity: 1 },
                }}
            />
        );
    };

    const renderMobile = () => (
        <>
            <IconButton color="inherit" onClick={() => setMobileOpen(true)} aria-label="Otwórz nawigację">
                <MenuIcon />
            </IconButton>

            <Drawer anchor="right" open={mobileOpen} onClose={handleMobileClose}>
                <Box sx={{ width: 280, maxWidth: '85vw', py: 2 }} role="navigation">
                    <Typography variant="h6" sx={{ px: 2, mb: 2, fontWeight: 700 }}>
                        Nawigacja
                    </Typography>

                    {groups.map((group) => (
                        <Box key={group.name} sx={{ mb: 2 }}>
                            <Typography
                                variant="overline"
                                color={group.active ? 'primary.main' : 'text.secondary'}
                                sx={{ display: 'block', px: 2, mb: 0.5, fontWeight: 700 }}
                            >
                                {group.name}
                            </Typography>

                            {group.items.map((p) => renderMenuItem(p, handleMobileClose))}
                        </Box>
                    ))}
                </Box>
            </Drawer>
        </>
    );

    if (!pages.length) return null;
    if (isMobile) return renderMobile();

    return (
        <Box sx={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
            <Tabs
                value={selectedTab}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label="Nawigacja główna"
                sx={{
                    width: '100%',
                    minHeight: 40,
                    color: 'inherit',
                    '& .MuiTabs-scroller': { minWidth: 0 },
                    '& .MuiTabs-indicator': { height: 2 },
                    '& .MuiTabs-scrollButtons': {
                        width: 28,
                        flexShrink: 0,
                        color: 'inherit',
                        '&.Mui-disabled': { opacity: 0.15 },
                    },
                }}
            >
                {groups.map(renderTab)}
            </Tabs>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                slotProps={{ paper: { sx: { minWidth: 190, maxHeight: '75vh' } } }}
            >
                {activeGroup?.items.map((p) => renderMenuItem(p, handleClose))}
            </Menu>
        </Box>
    );
};

export default MainNav;
