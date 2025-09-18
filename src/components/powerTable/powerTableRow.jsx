import React from 'react';
import { TableRow, TableCell } from '@mui/material';
import useRowRules from './hooks/useRowRules';

const PowerTableRow = ({ row, columnsSchema, rowRules = [], settings = {sx: {}}}) => {
  const rowStyle = useRowRules(row, rowRules);

  const height = settings?.rowHeight || 48;
  const densityPadding = {
    compact: '4px 8px',
    standard: '6px 12px',
    comfortable: '10px 16px',
  }[settings?.density || 'standard'];

  return (
    <TableRow sx={{ ...rowStyle, height }}>
      {columnsSchema.getVisibleColumns().map((col) => (
        <TableCell           
          key={col.field} 
          sx={{
            width: col.width, padding: densityPadding, whiteSpace: 'wrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            ...settings.sx
          }}
          title={`${col.field}`}
        >
          {row[col.field]}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default PowerTableRow;
