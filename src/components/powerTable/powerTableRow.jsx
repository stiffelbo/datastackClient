import React from 'react';
import { TableRow } from '@mui/material';
import useRowRules from './hooks/useRowRules';
import PowerTableCell from './powerTableCell';

const PowerTableRow = ({ row, columnsSchema, rowRules = [], settings = {} }) => {
  const rowStyle = useRowRules(row, rowRules);

  const densityPadding = {
    compact: '2px 6px',       // 👈 bardzo ciasno
    standard: '4px 8px',      // 👈 domyślnie
    comfortable: '8px 12px',  // 👈 więcej powietrza
  }[settings?.density || 'standard'];

  const fontSize = settings.fontSize || '0.8rem';

  return (
    <TableRow sx={{ ...rowStyle, height: 'auto' }}>
      {columnsSchema.getVisibleColumns().map((col) => (
        <PowerTableCell
          key={col.field}
          value={row[col.field]}
          column={col}
          settings={{
            ...settings,
            densityPadding,
            fontSize,
          }}
        />
      ))}
    </TableRow>
  );
};

export default PowerTableRow;
