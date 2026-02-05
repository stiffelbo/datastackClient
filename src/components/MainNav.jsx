import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Menu,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Chip
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { useNav } from '../context/NavContext';

const MainNav = ({ pages }) => {
  if (!pages) return;
  const { page } = useNav();
  const [anchorEls, setAnchorEls] = useState({});

  // Grupowanie stron po `group`
  const groupedPages = pages.reduce((acc, p) => {
    if (!acc[p.group]) acc[p.group] = [];
    acc[p.group].push(p);
    return acc;
  }, {});

  const handleOpen = (group) => (event) => {
    setAnchorEls((prev) => ({ ...prev, [group]: event.currentTarget }));
  };

  const handleClose = (group) => () => {
    setAnchorEls((prev) => ({ ...prev, [group]: null }));
  };

  const renderGroup = (group, pages) => {
    if (pages.length === 1) {
      const p = pages[0];
      return (
        <Button
          key={p.name}
          color={p.name === page ? 'primary' : 'inherit'}
          component={RouterLink}
          to={p.name}
          size="small"
        >
          {p.label}
        </Button>
      );
    }

    return (
      <Box key={group} sx={{ display: 'inline-block' }}>
        <Button
          onClick={handleOpen(group)}
          color={pages.some((p) => p.name === page) ? 'primary' : 'inherit'}
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
          {pages.map((p) => (
            <MenuItem
              key={p.name}
              component={RouterLink}
              to={p.name}
              selected={p.name === page}
              onClick={handleClose(group)}
            >
              {p.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  };

  const renderActivePage = () => {
    let activePageLabel = '';
    if (!page) {
      activePageLabel = 'Strona domowa';
    } else {
      const activePage = pages.find((p) => p.name === page);
      if (!activePage) return null;
      activePageLabel = activePage.label;
    }

    return (
      <Chip
        key={activePageLabel} // ⬅️ WAŻNE: reset animacji przy zmianie
        label={activePageLabel}
        size="medium"
        variant="outlined"
        color='primary'
        title={`Aktualnie na stronie: ${activePageLabel}`}
        sx={{
          height: 32,
          borderRadius: 999,
          fontWeight: 600,

          // start animacji
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
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {Object.entries(groupedPages).map(([group, groupPages]) =>
        renderGroup(group, groupPages)
      )}
      {renderActivePage()}
    </Box>
  );
};

export default MainNav;
