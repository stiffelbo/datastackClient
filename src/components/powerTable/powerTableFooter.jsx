import React from 'react';
import { TableFooter, TableRow, TableCell } from '@mui/material';
import { formatNumberPL } from './utils';

const PowerTableFooter = ({ data, columnsSchema }) => {
  const aggregates = columnsSchema.getAggregatedValues(data);

  return (
    <TableFooter>
      <TableRow sx={{ backgroundColor: '#f9f9f9', position: 'sticky', bottom: 0, zIndex: 1 }}>
        {columnsSchema.getVisibleColumns().map((col, idx) => {
          const raw = aggregates[col.field];
          const display = col.type === 'number' && typeof raw === 'number'
            ? formatNumberPL(raw)
            : raw ?? '';

          return (
            <TableCell
              key={col.field}
              sx={{ width: col.width, fontWeight: 'bold' }}
              title={`${col.field} ${col.aggregationFn}`}
            >
              {display}
            </TableCell>
          );
        })}
      </TableRow>
    </TableFooter>
  );
};


export default PowerTableFooter;
