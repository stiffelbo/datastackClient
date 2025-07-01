import React, { useState } from 'react';
import {
  TableHead, TableRow, TableCell,
  IconButton, Menu, MenuItem, Tooltip, Box, Typography, Chip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import GroupWorkIcon from '@mui/icons-material/GroupWork';

//comp
import ColumnConfigurator from './columnConfigurator';

const PowerTableHead = ({ columnsSchema }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeField, setActiveField] = useState(null);

  const openMenu = (e, field) => {
    setMenuAnchor(e.currentTarget);
    setActiveField(field);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setActiveField(null);
  };

  const capitalize = (str) => str?.charAt(0).toUpperCase() + str.slice(1);

  return (
    <TableHead>
      <TableRow>
        {columnsSchema.getVisibleColumns().map((col) => {
          const sortDir = columnsSchema.getSortDirection(col.field);
          const groupIndex = columnsSchema.getGroupOrder(col.field);
          return (
            <TableCell
              key={col.field}
              sx={{
                width: col.width,
                maxWidth: col.maxWidth,
                minWidth: col.minWidth,
                backgroundColor: '#f0f0f0',
                fontWeight: 'bold',
                position: 'sticky',
                top: 0,
                zIndex: 2,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1, borderRight: '1px solid gray' }}>
                <Tooltip title={col.title || col.headerName || col.field}>
                  <span onClick={(e) => openMenu(e, col.field)}>
                    {capitalize(col.headerName || col.field)}
                  </span>
                </Tooltip>

                {sortDir === 'asc' && <ArrowUpwardIcon fontSize="small" />}
                {sortDir === 'desc' && <ArrowDownwardIcon fontSize="small" />}

                {groupIndex !== -1 && (
                  <Chip
                    size="small"
                    label={`#${groupIndex + 1}`}
                    icon={<GroupWorkIcon fontSize="small" />}
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            </TableCell>
          );
        })}
      </TableRow>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
      >
        {activeField && (
          <ColumnConfigurator
            field={activeField}
            columnsSchema={columnsSchema}
            close={closeMenu}
          />
        )}
      </Menu>

    </TableHead>
  );
};

export default PowerTableHead;
