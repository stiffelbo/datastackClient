import React, { useRef, useEffect } from 'react';

import { createCellParams } from './cell/cellParams';

import { TableFooter, TableRow, TableCell } from '@mui/material';

import PowerTableCell from './powerTableCell';

const PowerTableFooter = ({
  data,
  columnsSchema,
  settings = {},
  actionsApi = {},
  onHeightChange,
  height,
  // 🔹 jak w headerze:
  isTree = false,
  treeColumnWidth = 40,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && onHeightChange) {
      const calcheight = ref.current.getBoundingClientRect().height;
      // lepiej reagować na zmianę wysokości niż na równość
      if (height !== calcheight) onHeightChange(calcheight);
    }
  }, [height, onHeightChange]);

  const aggregates = columnsSchema.getAggregatedValues(data);
  const visibleCols = columnsSchema.getVisibleColumns();

  // pozwalamy, żeby isTree przyszło też z settings, jeśli ktoś nie podał propsa
  const effectiveIsTree = typeof isTree === 'boolean' ? isTree : !!settings.isTree;
  const effectiveTreeColWidth =
    treeColumnWidth || settings.treeColumnWidth || 40;

  return (
    <TableFooter ref={ref} sx={{height}}>
      <TableRow
        sx={{
          backgroundColor: '#f9f9f9',
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
          height
        }}
      >
        {/* 🔹 systemowa pierwsza kolumna dla drzewa */}
        {effectiveIsTree && (
          <TableCell
            sx={{
              width: effectiveTreeColWidth,
              minWidth: effectiveTreeColWidth,
              maxWidth: effectiveTreeColWidth,
              backgroundColor: '#f9f9f9',
              borderRight: '1px solid #ddd',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
            }}
          >
            {/* Tu możesz dać np. label "SUMA" / "AGG" itd., na razie puste */}
          </TableCell>
        )}

        {visibleCols.map((col) => {
          const raw = aggregates[col.field];
          const params = createCellParams({ value: raw, row: {}, column: col });

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
              columnsSchema={columnsSchema}
              settings={{
                ...settings,
                height,
                sx: { fontWeight: 'bold', ...(settings.sx || {}) },
              }}
              parent="footer"
              actionsApi={actionsApi}
              params={params}
            />
          );
        })}
      </TableRow>
    </TableFooter>
  );
};

export default PowerTableFooter;
