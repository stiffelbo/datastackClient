import React from 'react';
import {
  TableRow,
  TableCell,
  Box,
  IconButton,
  Badge
} from '@mui/material';

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
  parent = 'body',

  // potrzebne dla TanStack Virtual
  sx = {},
}) => {
  const densityPadding = {
    compact: '2px 6px',
    standard: '4px 8px',
    comfortable: '8px 12px',
  }[settings?.density || 'standard'];

  const fontSize =
    settings?.fontSize || '0.8rem';

  const visibleCols =
    columnsSchema.getVisibleColumns?.() || [];

  const isSelected =
    +actionsApi.selected === +row.id
      ? true
      : actionsApi.selectedIds?.includes?.(+row.id) ?? false;

  const isTree = !!settings?.isTree;

  const treeColumnWidth =
    settings?.treeColumnWidth ?? 140;

  const treeIndentStep =
    settings?.treeIndentStep ?? 12;

  const level =
    row.__treeLevel ?? 0;

  const hasChildren =
    row.__treeHasChildren ?? false;

  const childrenCount =
    row.__childrenCount;

  const path =
    row.__treePath;

  const collapsed =
    row.__treeCollapsed ?? false;

  const handleToggle = (e) => {
    e.stopPropagation();

    if (!hasChildren) return;

    actionsApi.toggleTreeNode?.(path);
  };

  const isVirtualized =
    !!settings?.isVirtualized;

  const rowHeight =
    isVirtualized && Number(settings?.rowHeight) > 0
      ? Number(settings.rowHeight)
      : null;

  return (
    <TableRow
      sx={{
        /*
         * Najpierw styl przekazany przez virtualizer:
         *
         * position: absolute
         * transform: translateY(...)
         * display: flex
         * width: 100%
         */
        ...sx,

        /*
         * Potem nasze ograniczenia wysokości.
         * Dzięki temu zewnętrzne sx nie rozwali rowHeight.
         */
        ...(isVirtualized
          ? {
              height: `${rowHeight}px`,
              minHeight: `${rowHeight}px`,
              maxHeight: `${rowHeight}px`,

              boxSizing: 'border-box',

              '& > td': {
                height: `${rowHeight}px`,
                minHeight: `${rowHeight}px`,
                maxHeight: `${rowHeight}px`,

                boxSizing: 'border-box',

                paddingTop: 0,
                paddingBottom: 0,

                overflow: 'hidden',
                whiteSpace: 'nowrap',
              },
            }
          : {}),
      }}
    >
      {isTree && (
        <TableCell
          sx={{
            /*
             * Przy flex row musimy jawnie ustawić flex-basis.
             */
            flex: `0 0 ${treeColumnWidth}px`,

            width: treeColumnWidth,
            minWidth: treeColumnWidth,
            maxWidth: treeColumnWidth,

            borderRight: '1px solid #eee',

            ...(isVirtualized
              ? {
                  height: `${rowHeight}px`,
                  minHeight: `${rowHeight}px`,
                  maxHeight: `${rowHeight}px`,

                  padding: 0,

                  overflow: 'hidden',
                  boxSizing: 'border-box',
                }
              : {
                  padding: '4px 4px',
                }),
          }}
        >
          <Box
            sx={{
              height: isVirtualized
                ? `${rowHeight}px`
                : 'auto',

              minHeight: 0,

              maxHeight: isVirtualized
                ? `${rowHeight}px`
                : 'none',

              display: 'flex',
              alignItems: 'center',

              /*
               * ml działa, ale padding jest trochę
               * bardziej przewidywalny wewnątrz fixed width.
               */
              pl: level * treeIndentStep,

              boxSizing: 'border-box',

              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {hasChildren ? (
              <Badge
                color="warning"
                overlap="circular"
                badgeContent={
                  collapsed && childrenCount > 0
                    ? childrenCount
                    : null
                }
              >
                <IconButton
                  size="small"
                  onClick={handleToggle}
                  title={`Ilość pod wpisów: ${childrenCount}`}
                  sx={{
                    padding: 0,

                    width: 20,
                    height: 20,
                    minWidth: 20,
                    minHeight: 20,

                    flexShrink: 0,
                  }}
                >
                  {collapsed ? (
                    <ChevronRightIcon
                      fontSize="small"
                    />
                  ) : (
                    <ExpandMoreIcon
                      fontSize="small"
                    />
                  )}
                </IconButton>
              </Badge>
            ) : (
              <Box
                sx={{
                  width: 20,
                  height: 20,

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  flexShrink: 0,
                }}
              >
                <ChevronRightIcon
                  sx={{
                    fontSize: 15,
                    color: 'text.disabled',
                  }}
                />
              </Box>
            )}
          </Box>
        </TableCell>
      )}

      {visibleCols.map((col) => {
        const params =
          createCellParams({
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

              rowHeight,

              densityPadding:
                isVirtualized
                  ? '0px 8px'
                  : densityPadding,

              fontSize,

              /*
               * Przyda się DisplayCell/EditCell/
               * ActionCell, jeśli chcesz rozpoznać,
               * że row działa w flex layout.
               */
              virtualFlex: isVirtualized,
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