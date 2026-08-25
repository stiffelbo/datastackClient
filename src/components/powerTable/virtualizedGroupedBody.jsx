// virtualizedGroupedBody.jsx
import React from 'react';
import {
  TableBody,
  TableRow,
  TableCell,
  Box,
  IconButton
} from '@mui/material';

import {
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';

import PowerTableCell from './powerTableCell';
import PowerTableRow from './powerTableRow';
import ActionCell from './cell/actionCell';

const VirtualizedGroupedBody = ({
  flatData,
  columnsSchema,
  rowRules,
  settings,
  groupCollapseState,
  toggleCollapse,
  rowVirtualizer,
  actionsApi,
  editing,
}) => {
  const rowHeight = Number(settings?.rowHeight) || 45;
  const fontSize = settings?.fontSize || '0.8rem';

  const visibleColumns =
    columnsSchema.getVisibleColumns();

  const virtualRows =
    rowVirtualizer.getVirtualItems();

  const totalSize =
    rowVirtualizer.getTotalSize();

  return (
    <TableBody
      sx={{
        position: 'relative',
        display: 'block',
        height: `${totalSize}px`,
        width: '100%',
      }}
    >
      {virtualRows.map((virtualRow) => {
        const item = flatData[virtualRow.index];

        if (!item) return null;

        const virtualRowSx = {
          position: 'absolute',
          top: 0,
          left: 0,

          width: '100%',
          height: `${rowHeight}px`,
          minHeight: `${rowHeight}px`,
          maxHeight: `${rowHeight}px`,

          transform: `translateY(${virtualRow.start}px)`,

          display: 'flex',

          boxSizing: 'border-box',
        };

        /*
         * -------------------------------------------------
         * GROUP ROW
         * -------------------------------------------------
         */
        if (item.type === 'group') {
          const open =
            !groupCollapseState[item.path];

          const groupRows =
            item.rows || [];

          return (
            <TableRow
              key={`group-${item.path}`}
              data-index={virtualRow.index}
              sx={{
                ...virtualRowSx,

                backgroundColor: '#f3f3f3',

                '& > td': {
                  height: `${rowHeight}px`,
                  minHeight: `${rowHeight}px`,
                  maxHeight: `${rowHeight}px`,
                  boxSizing: 'border-box',
                  paddingTop: 0,
                  paddingBottom: 0,
                  overflow: 'hidden',
                },
              }}
            >
              {visibleColumns.map((col) => {
                /*
                 * ACTION COLUMN
                 */
                if (col.type === 'action') {
                  return (
                    <ActionCell
                      key={`group-${item.path}-${col.field}`}
                      column={col}
                      params={{}}
                      parent="group"
                      actionsApi={actionsApi}
                      data={groupRows}
                      settings={settings}
                      cellSX={{
                        flex: '0 0 auto',

                        width: col.width,
                        minWidth: col.minWidth,
                        maxWidth: col.maxWidth,
                      }}
                    />
                  );
                }

                /*
                 * GROUP LABEL COLUMN
                 */
                if (col.field === item.field) {
                  let displayValue =
                    item.value;

                  if (
                    col.input === 'select' &&
                    Array.isArray(col.options) &&
                    displayValue
                  ) {
                    const option =
                      col.options.find(
                        (option) => {
                          if (
                            typeof option ===
                            'object'
                          ) {
                            return (
                              +option.value ===
                              +item.value
                            );
                          }

                          return false;
                        }
                      );

                    if (option) {
                      displayValue =
                        option.label;
                    }
                  }

                  return (
                    <TableCell
                      key={col.field}
                      sx={{
                        flex: '0 0 auto',

                        width: col.width,
                        minWidth: col.minWidth,
                        maxWidth: col.maxWidth,

                        height: `${rowHeight}px`,
                        minHeight: `${rowHeight}px`,
                        maxHeight: `${rowHeight}px`,

                        padding: 0,

                        boxSizing:
                          'border-box',

                        overflow: 'hidden',

                        borderRight:
                          '1px solid #eee',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          minHeight: 0,
                          maxHeight: '100%',

                          boxSizing:
                            'border-box',

                          display: 'flex',
                          alignItems: 'center',

                          px: 1,

                          overflow: 'hidden',
                          whiteSpace: 'nowrap',

                          fontSize,
                        }}
                        title={String(
                          displayValue ?? ''
                        )}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            toggleCollapse(
                              item.path
                            )
                          }
                          sx={{
                            width: 32,
                            height: 32,
                            minWidth: 32,
                            minHeight: 32,

                            padding: 0,

                            flexShrink: 0,
                          }}
                        >
                          {open ? (
                            <ExpandMore />
                          ) : (
                            <ExpandLess />
                          )}
                        </IconButton>

                        <Box
                          component="span"
                          sx={{
                            minWidth: 0,

                            overflow: 'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {`${displayValue} (${item.rows?.length ?? 0})`}
                        </Box>
                      </Box>
                    </TableCell>
                  );
                }

                /*
                 * AGGREGATION
                 */
                if (
                  item.aggregates?.[
                    col.field
                  ] !== undefined
                ) {
                  return (
                    <PowerTableCell
                      key={col.field}
                      value={
                        item.aggregates[
                          col.field
                        ]
                      }
                      column={col}
                      columnsSchema={
                        columnsSchema
                      }
                      settings={settings}
                      parent="grouped"
                      actionsApi={actionsApi}
                    />
                  );
                }

                /*
                 * EMPTY CELL
                 */
                return (
                  <TableCell
                    key={col.field}
                    sx={{
                      flex: '0 0 auto',

                      width: col.width,
                      minWidth: col.minWidth,
                      maxWidth: col.maxWidth,

                      height: `${rowHeight}px`,
                      minHeight: `${rowHeight}px`,
                      maxHeight: `${rowHeight}px`,

                      padding: 0,

                      boxSizing:
                        'border-box',

                      overflow: 'hidden',

                      borderRight:
                        '1px solid #eee',
                    }}
                  />
                );
              })}
            </TableRow>
          );
        }

        /*
         * -------------------------------------------------
         * NORMAL DATA ROW
         * -------------------------------------------------
         */

        const rowId =
          item.row?.id ??
          virtualRow.index;

        return (
          <PowerTableRow
            key={`row-${rowId}`}
            row={item.row}
            columnsSchema={columnsSchema}
            rowRules={rowRules}
            settings={settings}
            actionsApi={actionsApi}
            parent="grouprow"
            editing={editing}

            /*
             * NOWE:
             * PowerTableRow musi przyjąć sx
             * albo style.
             */
            sx={virtualRowSx}
          />
        );
      })}
    </TableBody>
  );
};

export default VirtualizedGroupedBody;