import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Menu,
  MenuItem,
  Box,
  Chip
} from '@mui/material';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { useNav } from '../context/NavContext';

const MainNav = ({ pages }) => {
  if (!pages?.length) return null;

  const { page } = useNav();
  const [anchorEls, setAnchorEls] = useState({});

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
      <Box key={group} sx={{ display: 'inline-block' }}>
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

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
      {Object.entries(groupedPages).map(([group, groupPages]) =>
        renderGroup(group, groupPages)
      )}

      {!!externalLinks.length && renderGroup('Strony zewnętrzne', externalLinks)}

      {renderActivePage()}
    </Box>
  );
};

export default MainNav;