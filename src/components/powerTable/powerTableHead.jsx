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
import ActionCell from './cell/actionCell';

const typeIcons = {
  string: '🅰️',
  number: '🔢',
  date: '📅',
  bool: '✔️',
  boolean: '✔️',
  fk: '🔗',
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
  actionsApi,
  data = [],
  // 🔹 NOWE:
  isTree = false,
  treeColumnWidth = 40,
}) => {
  const ref = useRef(null);

  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    if (ref.current && onHeightChange) {
      const calcHeight = ref.current.getBoundingClientRect().height;
      if (height !==  calcHeight){
        console.log(height, calcHeight);
        onHeightChange(calcHeight);
      } 
    }
  }, [height, onHeightChange]);

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

  const visibleCols = columnsSchema.getVisibleColumns();

  return (
    <>
      <TableHead ref={ref}>
        <TableRow>
          {/* 🔹 Systemowa pierwsza kolumna dla trybu TREE */}
          {isTree && (
            <TableCell
              sx={{
                width: treeColumnWidth,
                minWidth: treeColumnWidth,
                maxWidth: treeColumnWidth,
                overflow: 'hidden',
                backgroundColor: '#f8f8f8ff',
                fontWeight: 'bold',
                fontSize: '0.8em',
                position: 'sticky',
                top: 0,
                zIndex: 3, // trochę wyżej niż zwykłe head cells
                whiteSpace: 'nowrap',
                borderRight: '1px solid #ddd',
              }}
              // tu możesz kiedyś wrzucić np. ikonę drzewa / expand-all
              title="Struktura drzewa"
            >
              {/* Na razie pusto lub jakiś symbol, np.: */}
              {/* <span>🌳</span> */}
            </TableCell>
          )}

          {visibleCols.map((col) => {
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

            const bgColor = col.editable ? "#e3f2fd" : 'white';
            cellSX['backgroundColor'] = bgColor;

            let cellTitle = col.headerName
              ? [col.headerName, col.fieldGroup].filter(Boolean).join(' - ')
              : [col.field, col.fieldGroup].filter(Boolean).join(' - ');

            if (col.editable) cellTitle += ' edytowalne';

            if (col.type === 'action') {
              return (
                <ActionCell
                  key={col.field}
                  column={col}
                  columnsSchema={columnsSchema}
                  params={{}}
                  parent="header"
                  actionsApi={actionsApi}
                  cellSX={cellSX}
                  data={data}
                />
              );
            } else {
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
                    <Box
                      component="span"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      onClick={() => setActiveField(col.field)}
                    >
                      <span>{typeIcons[col.type] || ''}</span>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, userSelect: 'none' }}
                      >
                        {col.headerName || col.field}
                      </Typography>
                    </Box>

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
            }
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
