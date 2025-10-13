import React from 'react';
import { TableRow } from '@mui/material';

import { createCellParams } from './cell/cellParams';

import PowerTableCell from './powerTableCell';

const PowerTableRow = ({ row, columnsSchema, rowRules = [], settings = {}, editing }) => {

  const densityPadding = {
    compact: '2px 6px',       // 👈 bardzo ciasno
    standard: '4px 8px',      // 👈 domyślnie
    comfortable: '8px 12px',  // 👈 więcej powietrza
  }[settings?.density || 'standard'];

  const fontSize = settings.fontSize || '0.8rem';

  const visibleColls = columnsSchema.getVisibleColumns();

  return (
    <TableRow sx={{ height: settings.rowHeight || 'auto' }}>
      {visibleColls.map((col) => {

        const params = createCellParams({ row, column: col });
        return <PowerTableCell
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
        />
      })}
    </TableRow>
  );
};

export default PowerTableRow;
