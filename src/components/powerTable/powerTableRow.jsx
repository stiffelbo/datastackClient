import React from 'react';
import { TableRow, TableCell, Box, IconButton, Badge } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { createCellParams } from './cell/cellParams';
import PowerTableCell from './powerTableCell';

const PowerTableRow = ({
  row,
  columnsSchema,
  rowRules = [],
  actionsApi = {},
  settings = {},
  editing,
  parent = "body",
}) => {
  const densityPadding = {
    compact: '2px 6px',
    standard: '4px 8px',
    comfortable: '8px 12px',
  }[settings?.density || 'standard'];

  const fontSize = settings.fontSize || '0.8rem';

  const visibleCols = columnsSchema.getVisibleColumns?.() || [];

  const isSelected =
    +actionsApi.selected === +row.id
      ? true
      : actionsApi.selectedIds?.includes?.(+row.id) ?? false;

  const baseBgColor = isSelected ? '#e3f2fd' : 'inherit';

  const isTree = settings?.isTree;
  const treeColumnWidth = settings?.treeColumnWidth ?? 140;
  const treeIndentStep = settings?.treeIndentStep ?? 12;

  const level = row.__treeLevel ?? 0;
  const hasChildren = row.__treeHasChildren ?? false;
  const childrenCount = row.__childrenCount;
  const path = row.__treePath;
  const collapsed = row.__treeCollapsed ?? false;

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!hasChildren) return;
    actionsApi.toggleTreeNode?.(path);
  };

  return (
    <TableRow
      sx={{
        height: settings.rowHeight || 'auto',
        backgroundColor: baseBgColor,
      }}
    >
      {/* 🔹 Systemowa pierwsza kolumna dla TREE */}
      {isTree && (
        <TableCell
          sx={{
            width: treeColumnWidth,
            minWidth: treeColumnWidth,
            maxWidth: treeColumnWidth,
            borderRight: '1px solid #eee',
            padding: '4px 4px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              ml: level * treeIndentStep,
              boxSizing: 'border-box',
            }}
          >
            {hasChildren ? (
              <Badge
                color="warning"
                overlap="circular"
                badgeContent={collapsed && childrenCount > 0 ? childrenCount : null}
              >
                <IconButton
                  size="small"
                  onClick={handleToggle}
                  sx={{
                    padding: 0,
                    width: 20,
                    height: 20,
                  }}
                  title={`Ilość pod wpisów: ${childrenCount}`}
                >
                  {collapsed ? (
                    <ChevronRightIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </IconButton>
              </Badge>
            ) : (
              // liść – mała, neutralna kropka
              <Box
                component="span"
                sx={{
                  fontSize: '36px',
                  lineHeight: 1,
                  color: '#a0a0a0ff',
                }}
              >
                •
              </Box>
            )}
          </Box>
        </TableCell>
      )}


      {/* 🔹 Biznesowe kolumny */}
      {visibleCols.map((col) => {
        const params = createCellParams({
          value: row[col.field],
          row,
          column: col,
        });

        return (
          <PowerTableCell
            key={col.field}
            value={row[col.field]}
            column={col}
            params={params}
            settings={{
              ...settings,
              densityPadding,
              fontSize,
            }}
            editing={editing}
            parent={parent}
            actionsApi={actionsApi}
          />
        );
      })}
    </TableRow>
  );
};

export default PowerTableRow;
