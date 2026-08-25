import React from 'react';
import { TableBody } from '@mui/material';

import PowerTableRow from './powerTableRow';
import VirtualizedBody from './virtualizedBody';

const PowerTableBody = ({
  data,
  columnsSchema,
  rowRules = [],
  settings = {},
  rowVirtualizer,
  editing,
  actionsApi,
}) => {
  if (
    settings.isVirtualized &&
    rowVirtualizer
  ) {
    return (
      <VirtualizedBody
        data={data}
        columnsSchema={columnsSchema}
        rowRules={rowRules}
        settings={settings}
        rowVirtualizer={rowVirtualizer}
        editing={editing}
        actionsApi={actionsApi}
      />
    );
  }

  return (
    <TableBody>
      {data.map((row, idx) => (
        <PowerTableRow
          key={row.id ?? idx}
          row={row}
          columnsSchema={columnsSchema}
          rowRules={rowRules}
          settings={{
            ...settings,

            /*
             * Zwykły body nie korzysta
             * z absolute/flex virtual rows.
             */
            virtualFlex: false,
          }}
          editing={editing}
          actionsApi={actionsApi}
          parent="body"
        />
      ))}
    </TableBody>
  );
};

export default PowerTableBody;