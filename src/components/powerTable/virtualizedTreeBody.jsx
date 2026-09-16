// virtualizedTreeBody.jsx

import React from 'react';
import { TableBody } from '@mui/material';
import PowerTableRow from './powerTableRow';

const VirtualizedTreeBody = ({
  flatData,
  columnsSchema,
  rowRules,
  settings,
  editing,
  actionsApi,
  rowVirtualizer,
}) => {
  const rowHeight =
    Number(settings?.rowHeight) || 45;

  /*
   * =====================================================
   * TANSTACK VIRTUAL
   * =====================================================
   */

  const virtualRows =
    rowVirtualizer.getVirtualItems();

  const totalSize =
    rowVirtualizer.getTotalSize();


  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <TableBody
      sx={{
        position: 'relative',

        /*
         * Tak samo jak w VirtualizedGroupedBody.
         *
         * TableBody reprezentuje pełną wysokość
         * wszystkich WIDOCZNYCH elementów drzewa.
         */
        display: 'block',

        height: `${totalSize}px`,

        width: '100%',
      }}
    >
      {virtualRows.map((virtualRow) => {
        /*
         * virtualRow.index wskazuje bezpośrednio
         * na element flatData.
         *
         * flatData zawiera tylko widoczne node'y,
         * czyli dzieci collapsed node'a nie istnieją
         * tutaj z punktu widzenia virtualizera.
         */
        const item =
          flatData[virtualRow.index];

        if (!item) {
          return null;
        }


        /*
         * =================================================
         * ROW POSITION
         * =================================================
         */

        const virtualRowSx = {
          position: 'absolute',

          top: 0,
          left: 0,

          width: '100%',

          height: `${rowHeight}px`,
          minHeight: `${rowHeight}px`,
          maxHeight: `${rowHeight}px`,

          transform:
            `translateY(${virtualRow.start}px)`,

          display: 'flex',

          boxSizing: 'border-box',
        };


        /*
         * =================================================
         * STABLE ROW KEY
         * =================================================
         */

        const idField =
          settings?.idField ?? 'id';

        const rowId =
          item.row?.[idField] ??
          item.row?.id ??
          item[idField] ??
          item.id ??
          item.path ??
          virtualRow.key ??
          virtualRow.index;


        /*
         * =================================================
         * TREE DATA ROW
         * =================================================
         *
         * parent="tree" zostaje bez zmian.
         *
         * PowerTableRow / PowerTableCell mogą dzięki temu
         * dalej obsługiwać:
         *
         * - tree column
         * - indentation
         * - expand/collapse
         * - actionsApi.toggleTreeNode
         */

        return (
          <PowerTableRow
            key={`tree-row-${rowId}`}

            row={item.row}

            columnsSchema={
              columnsSchema
            }

            rowRules={
              rowRules
            }

            settings={
              settings
            }

            editing={
              editing
            }

            actionsApi={
              actionsApi
            }

            parent="tree"

            /*
             * PowerTableRow musi przekazać sx
             * do swojego głównego TableRow.
             *
             * Dokładnie tak samo jak dla
             * VirtualizedGroupedBody.
             */
            sx={virtualRowSx}
          />
        );
      })}
    </TableBody>
  );
};

export default VirtualizedTreeBody;