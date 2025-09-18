import React from 'react';
import { TableCell } from '@mui/material';

const PowerTableCell = ({ value, column }) => {
  return (
    <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {value || ''}
    </TableCell>
  );
};

export default PowerTableCell;
