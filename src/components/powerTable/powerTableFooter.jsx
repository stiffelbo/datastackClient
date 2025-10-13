import React, { useRef, useEffect } from 'react';
import { TableFooter, TableRow } from '@mui/material';
import PowerTableCell from './powerTableCell';


const PowerTableFooter = ({ data, columnsSchema, settings = {}, onHeightChange, height }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && onHeightChange) {
      const calcheight = ref.current.getBoundingClientRect().height;
      if(height === calcheight) onHeightChange(calcheight);
    }
  }, [height]);
  const aggregates = columnsSchema.getAggregatedValues(data);

  return (
    <TableFooter ref={ref}>
      <TableRow
        sx={{
          backgroundColor: '#f9f9f9',
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
        }}
      >
        {columnsSchema.getVisibleColumns().map((col) => {
          const raw = aggregates[col.field];
          return (
            <PowerTableCell
              key={col.field}
              title={`${col.field} ${col.aggregationFn}`}
              value={raw}
              column={{
                ...col,
                // 👇 upewniamy się, że stopka też użyje formattera kolumny
                formatterKey: col.formatterKey,
                formatterOptions: col.formatterOptions,
              }}
              settings={{
                ...settings,
                sx: { fontWeight: 'bold', ...(settings.sx || {}) },
              }}
            />
          );
        })}
      </TableRow>
    </TableFooter>
  );
};

export default PowerTableFooter;
