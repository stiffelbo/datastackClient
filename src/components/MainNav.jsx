import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Menu,
  MenuItem,
  Box,
  Chip,
  Drawer,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu';

import { useNav } from '../context/NavContext';

const MainNav = ({ pages }) => {
  if (!pages?.length) return null;

  const { page } = useNav();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEls, setAnchorEls] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);

  const isExternal = (route) =>
    /^https?:\/\//i.test(String(route));

  const internalPages = pages.filter((p) => !isExternal(p.route));
  const externalLinks = pages.filter((p) => isExternal(p.route));

  const groupedPages = internalPages.reduce((acc, p) => {
    const groupName = p.group || 'Pozostałe';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(p);
    return acc;
  }, {});

  const handleOpen = (group) => (event) => {
    setAnchorEls((prev) => ({ ...prev, [group]: event.currentTarget }));
  };

  const handleClose = (group) => () => {
    setAnchorEls((prev) => ({ ...prev, [group]: null }));
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  const renderNavItem = (p, onClick) => {
    const external = isExternal(p.route);

    if (external) {
      return (
        <MenuItem
          key={p.name}
          component="a"
          href={p.route}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
        >
          {p.label}
        </MenuItem>
      );
    }

    return (
      <MenuItem
        key={p.name}
        component={RouterLink}
        to={p.route}
        selected={p.name === page}
        onClick={onClick}
      >
        {p.label}
      </MenuItem>
    );
  };

  const renderSingleButton = (p) => {
    const external = isExternal(p.route);

    if (external) {
      return (
        <Button
          key={p.name}
          color="inherit"
          component="a"
          href={p.route}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
        >
          {p.label}
        </Button>
      );
    }

    return (
      <Button
        key={p.name}
        color={p.name === page ? 'primary' : 'inherit'}
        component={RouterLink}
        to={p.route}
        size="small"
      >
        {p.label}
      </Button>
    );
  };

  const renderGroup = (group, items) => {
    if (!items?.length) return null;

    if (items.length === 1) {
      return renderSingleButton(items[0]);
    }

    const hasActiveInternalPage = items.some(
      (p) => !isExternal(p.route) && p.name === page
    );

    return (
      <Box key={group} sx={{ display: 'inline-block', flex: '0 0 auto' }}>
        <Button
          onClick={handleOpen(group)}
          color={hasActiveInternalPage ? 'primary' : 'inherit'}
          endIcon={<ArrowDropDownIcon />}
          size="small"
        >
          {group}
        </Button>

        <Menu
          anchorEl={anchorEls[group]}
          open={Boolean(anchorEls[group])}
          onClose={handleClose(group)}
        >
          {items.map((p) => renderNavItem(p, handleClose(group)))}
        </Menu>
      </Box>
    );
  };

  const renderActivePage = () => {
    let activePageLabel = '';

    if (!page) {
      activePageLabel = 'Strona domowa';
    } else if (page === 'userdashboard') {
      activePageLabel = 'Panel użytkownika';
    } else if (page === 'userlogform') {
      activePageLabel = 'Logi użytkownika';
    } else {
      const activePage = pages.find((p) => p.name === page);
      if (!activePage) return null;
      activePageLabel = activePage.label;
    }

    return (
      <Chip
        key={activePageLabel}
        label={activePageLabel}
        size="medium"
        variant="outlined"
        color="primary"
        title={`Aktualnie na stronie: ${activePageLabel}`}
        sx={{
          height: 32,
          borderRadius: 999,
          fontWeight: 600,
          flex: '0 0 auto',
          animation: 'dsChipIn 220ms ease-out, dsChipPulse 900ms ease-out',
          '@keyframes dsChipIn': {
            from: {
              opacity: 0,
              transform: 'translateY(2px)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
          '@keyframes dsChipPulse': {
            '0%': {
              boxShadow: '0 0 0 0 rgba(37,99,235,0.35)',
            },
            '70%': {
              boxShadow: '0 0 0 6px rgba(37,99,235,0)',
            },
            '100%': {
              boxShadow: '0 0 0 0 rgba(37,99,235,0)',
            },
          },
        }}
      />
    );
  };

  const renderMobileGroup = (group, items) => {
    if (!items?.length) return null;

    return (
      <Box key={group} sx={{ mb: 2 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{
            display: 'block',
            px: 2,
            mb: 0.5,
            fontWeight: 700,
          }}
        >
          {group}
        </Typography>

        {items.map((p) => renderNavItem(p, handleMobileClose))}
      </Box>
    );
  };

  if (isMobile) {
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            minWidth: 0,
          }}
        >
          <IconButton
            color="inherit"
            onClick={() => setMobileOpen(true)}
            aria-label="Otwórz nawigację"
          >
            <MenuIcon />
          </IconButton>

          {renderActivePage()}
        </Box>

        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={handleMobileClose}
        >
          <Box
            sx={{
              width: 280,
              maxWidth: '85vw',
              py: 2,
            }}
            role="navigation"
          >
            <Box sx={{ px: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Nawigacja
              </Typography>
            </Box>

            {Object.entries(groupedPages).map(([group, groupPages]) =>
              renderMobileGroup(group, groupPages)
            )}

            {!!externalLinks.length &&
              renderMobileGroup('Strony zewnętrzne', externalLinks)}
          </Box>
        </Drawer>
      </>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'thin',
        minWidth: 0,
      }}
    >
      {Object.entries(groupedPages).map(([group, groupPages]) =>
        renderGroup(group, groupPages)
      )}

      {!!externalLinks.length && renderGroup('Strony zewnętrzne', externalLinks)}

      {renderActivePage()}
    </Box>
  );
};

export default MainNav;
