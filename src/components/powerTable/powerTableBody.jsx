import React from 'react';
import { TableBody } from '@mui/material';
import PowerTableRow from './powerTableRow';
import VirtualizedBody from './virtualizedBody';

const PowerTableBody = ({
  data,
  columnsSchema,
  rowRules = [],
  settings = {},
  height,
  scrollHeight,
  scrollTop = 0,
  editing,
  actionsApi,
}) => {
  const viewportHeight =
    scrollHeight || height || settings.height || 400;

  if (settings.isVirtualized) {
    return (
      <VirtualizedBody
        data={data}
        columnsSchema={columnsSchema}
        rowRules={rowRules}
        settings={settings}
        height={viewportHeight}     // ← viewport, nie bodyHeight
        scrollTop={scrollTop}
        editing={editing}
        actionsApi={actionsApi}
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
          actionsApi={actionsApi}
        />
      ))}
    </TableBody>
  );
};

export default PowerTableBody;
