import React from 'react';
import { TableBody } from '@mui/material';

import PowerTableRow from './powerTableRow';

const VirtualizedBody = ({
  data,
  columnsSchema,
  rowRules,
  settings,
  rowVirtualizer,
  editing,
  actionsApi,
}) => {
  const rowHeight =
    Number(settings?.rowHeight) || 45;

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

        boxSizing: 'border-box',
      }}
    >
      {virtualRows.map((virtualRow) => {
        const row = data[virtualRow.index];

        if (!row) {
          return null;
        }

        const rowId =
          row.id ??
          virtualRow.index;

        return (
          <PowerTableRow
            key={`row-${rowId}`}
            row={row}
            columnsSchema={columnsSchema}
            rowRules={rowRules}
            settings={{
              ...settings,

              /*
               * Ten renderer używa już
               * absolute + flex rows.
               */
              isVirtualized: true,
              virtualFlex: true,
              rowHeight,
            }}
            editing={editing}
            actionsApi={actionsApi}
            parent="body"

            sx={{
              position: 'absolute',

              top: 0,
              left: 0,

              width: '100%',

              height: `${rowHeight}px`,
              minHeight: `${rowHeight}px`,
              maxHeight: `${rowHeight}px`,

              display: 'flex',

              transform:
                `translateY(${virtualRow.start}px)`,

              boxSizing: 'border-box',
            }}
          />
        );
      })}
    </TableBody>
  );
};

export default VirtualizedBody;