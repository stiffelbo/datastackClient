import React from 'react';
import { TableBody } from '@mui/material';
import PowerTableRow from './powerTableRow';

const PowerTableBody = ({ data, columnsSchema, rowRules = [], settings = {} }) => {
  return (
    <TableBody>
      {data.map((row, idx) => (
        <PowerTableRow
          key={row.id || idx}
          row={row}
          columnsSchema={columnsSchema}
          rowRules={rowRules}
          settings={settings}
        />
      ))}
    </TableBody>
  );
};

export default PowerTableBody;
