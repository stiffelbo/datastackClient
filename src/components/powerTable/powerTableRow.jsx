import React from 'react';
import { TableRow } from '@mui/material';

import { createCellParams } from './cell/cellParams';

import PowerTableCell from './powerTableCell';

const PowerTableRow = ({ row, columnsSchema, rowRules = [], actionsApi = {}, settings = {}, editing, parent = "body" }) => {

  const densityPadding = {
    compact: '2px 6px',       // 👈 bardzo ciasno
    standard: '4px 8px',      // 👈 domyślnie
    comfortable: '8px 12px',  // 👈 więcej powietrza
  }[settings?.density || 'standard'];

  const fontSize = settings.fontSize || '0.8rem';

  const visibleColls = columnsSchema.getVisibleColumns();

  const isSelected = +actionsApi.selected === +row.id ? true : actionsApi.selectedIds.includes(+row.id) ? true : false;
  
  const color = isSelected ? "#e3f2fd" : 'inherit';
  return (
    <TableRow sx={{ height: settings.rowHeight || 'auto', backgroundColor: color }}>
      {visibleColls.map((col) => {

        const params = createCellParams({ value: row[col.field], row, column: col });
        
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
          parent={parent}
          actionsApi={actionsApi}
        />
      })}
    </TableRow>
  );
};

export default PowerTableRow;
