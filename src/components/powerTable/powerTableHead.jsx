import React, { useState } from 'react';
import {
  TableHead, TableRow, TableCell,
  IconButton, Menu, Tooltip, Box, Chip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

import ColumnConfigurator from './columnConfigurator';
import { generateCollapseKey } from './utils';

const typeIcons = {
  string: '🅰️',
  number: '🔢',
  date: '📅',
  boolean: '✔️'
};

const PowerTableHead = ({ initialData, columnsSchema, groupCollapseState = {}, onToggleCollapse = null }) => {
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

  return (
    <TableHead>
      <TableRow>
        {columnsSchema.getVisibleColumns().map((col) => {
          const sortDir = columnsSchema.getSortDirection(col.field);

          const groupIndex = col.groupIndex;
          const isGrouped = typeof groupIndex === 'number';

          let collapseKey = null;
          let isCollapsed = false;

          const pathsAtLevel = Object.keys(groupCollapseState).filter(p => p.split('/').length === groupIndex + 1);
          const allCollapsed = pathsAtLevel.every(p => groupCollapseState[p] === true);

          if (isGrouped) {
            collapseKey = generateCollapseKey(col.field, groupIndex);
            isCollapsed = groupCollapseState?.[collapseKey] === true;
          }
          return (
            <TableCell
              key={col.field}
              sx={{
                cursor: 'pointer',
                width: col.width,
                maxWidth: col.maxWidth,
                minWidth: col.minWidth,
                overflow: 'hidden',
                backgroundColor: '#f8f8f8ff',
                fontWeight: 'bold',
                fontSize: '0.8em',
                position: 'sticky',
                top: 0,
                zIndex: 2,
                whiteSpace: 'nowrap',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 1,
                  borderRight: '1px solid gray',
                  
                }}
              >
                <Tooltip title={`${col.headerName}` || `${col.field}`}>
                  <span onClick={(e) => openMenu(e, col.field)}>
                    {/* Ikonka typu */}
                    <span style={{ marginRight: 4 }}>
                      {typeIcons[col.type] || '❓'}
                    </span>
                    {(col.headerName || col.field)}
                  </span>
                </Tooltip>

                {/* sort indicators */}
                {sortDir === 'asc' && <ArrowUpwardIcon fontSize="small" />}
                {sortDir === 'desc' && <ArrowDownwardIcon fontSize="small" />}

                {/* group indicator */}
                {isGrouped && (
                  <Chip
                    size="small"
                    label={`#${groupIndex + 1}`}
                    icon={<GroupWorkIcon fontSize="small" />}
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                )}

                {/* collapse button for groups */}
                {isGrouped && onToggleCollapse && (
                  <IconButton onClick={() => onToggleCollapse(groupIndex)}>
                    {allCollapsed ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}

                {/* 👇 NEW: active filters badge */}
                {Array.isArray(col.filters) && col.filters.length > 0 && (
                  <Chip
                    size="small"
                    color="warning"
                    label={col.filters.length}
                    sx={{ height: 20, fontSize: '0.7rem' }}
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
            data={initialData}
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
