import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Menu,
  MenuItem,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
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

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {Object.entries(groupedPages).map(([group, groupPages]) =>
        renderGroup(group, groupPages)
      )}
    </Box>
  );
};

export default MainNav;
