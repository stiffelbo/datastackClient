import React from 'react';
import { TableBody } from '@mui/material';
import PowerTableRow from './powerTableRow';
import VirtualizedBody from './virtualizedBody';

const PowerTableBody = ({
  data,
  columnsSchema,
  rowRules = [],
  settings = {},
  isVirtualized = false,
  height = 400,
  scrollTop = 0,
  editing
}) => {
  if (isVirtualized) {
    return (
      <VirtualizedBody
        data={data}
        columnsSchema={columnsSchema}
        rowRules={rowRules}
        settings={settings}
        height={height}
        scrollTop={scrollTop}
        editing={editing}
      />
    );
  }

  return (
    <TableBody>
      {data.map((row, idx) => (
        <PowerTableRow
          key={row.id || idx}
          row={row}
          columnsSchema={columnsSchema}
          rowRules={rowRules}
          settings={settings}
          editing={editing}
        />
      ))}
    </TableBody>
  );
};

export default PowerTableBody;
