import React, { useState, useEffect, useRef } from 'react';
import {
  TableHead, TableRow, TableCell, Typography,
  IconButton, Tooltip, Box, Chip
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

import ColumnConfigurator from './columnConfigurator/columnConfigurator';
import { generateCollapseKey } from './utils';

const typeIcons = {
  string: '🅰️',
  number: '🔢',
  date: '📅',
  boolean: '✔️',
};

const getCellSX = (col) => ({
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
  borderRight: '1px solid #ddd',
});

const PowerTableHead = ({
  initialData,
  columnsSchema,
  groupCollapseState = {},
  onToggleCollapse = null,
  onHeightChange,
  height,
}) => {
  const ref = useRef(null);

  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    if (ref.current && onHeightChange) {
      const calcHeight = ref.current.getBoundingClientRect().height;
      if (height === calcHeight) onHeightChange(calcHeight);
    }
  }, [height]);

  // === Drag & drop columns ===
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (index) => setDraggedIndex(index);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (dropIndex) => {
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      columnsSchema.reorderColumn(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <>
      <TableHead ref={ref}>
        <TableRow>
          {columnsSchema.getVisibleColumns().map((col) => {
            const sortDir = columnsSchema.getSortDirection(col.field);
            const groupIndex = col.groupIndex;
            const isGrouped = typeof groupIndex === 'number';

            const pathsAtLevel = Object.keys(groupCollapseState).filter(
              (p) => p.split('/').length === groupIndex + 1
            );
            const allCollapsed = pathsAtLevel.every(
              (p) => groupCollapseState[p] === true
            );

            const cellSX = getCellSX(col);
            const cellTitle = col.headerName
              ? [col.headerName, col.fieldGroup].filter(Boolean).join(' - ')
              : [col.field, col.fieldGroup].filter(Boolean).join(' - ');

            return (
              <TableCell
                key={col.field}
                sx={cellSX}
                title={cellTitle}
                draggable
                onDragStart={() => handleDragStart(col.order)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(col.order)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {/* HEADER CLICK → OPEN CONFIGURATOR */}
                  <Tooltip title="Kliknij, aby skonfigurować kolumnę">
                    <Box
                      component="span"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      onClick={() => setActiveField(col.field)}
                    >
                      <span>{typeIcons[col.type] || '❓'}</span>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, userSelect: 'none' }}
                      >
                        {col.headerName || col.field}
                      </Typography>
                    </Box>
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
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        backgroundColor: '#f3f3f3',
                      }}
                      title={`Usuń grupowanie ${col.headerName || col.field}`}
                      onClick={() => columnsSchema.toggleGroupBy(col.field)}
                    />
                  )}

                  {/* collapse all button for level */}
                  {isGrouped && onToggleCollapse && (
                    <IconButton
                      size="small"
                      onClick={() => onToggleCollapse(groupIndex)}
                    >
                      {allCollapsed ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  )}

                  {/* filters badge */}
                  {Array.isArray(col.filters) && col.filters.length > 0 && (
                    <Chip
                      size="small"
                      color="warning"
                      label={col.filters.length}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}

                  {/* field group caption */}
                  {col.fieldGroup && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.65rem',
                        color: 'text.secondary',
                        opacity: 0.8,
                      }}
                    >
                      {col.fieldGroup}
                    </Typography>
                  )}
                </Box>
              </TableCell>
            );
          })}
        </TableRow>
      </TableHead>

      {/* === CENTRAL CONFIGURATOR === */}
      {activeField && (
        <ColumnConfigurator
          data={initialData}
          field={activeField}
          columnsSchema={columnsSchema}
          close={() => setActiveField(null)}
        />
      )}
    </>
  );
};

export default PowerTableHead;
