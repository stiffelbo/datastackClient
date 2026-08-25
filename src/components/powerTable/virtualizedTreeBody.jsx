// virtualizedTreeBody.jsx
import React, { useMemo } from 'react';
import { TableBody } from '@mui/material';
import PowerTableRow from './powerTableRow';

const VirtualizedTreeBody = ({
  flatData,
  columnsSchema,
  rowRules,
  settings,
  overscan = 0,
  height = 600,
  scrollTop = 0,
  editing,
  actionsApi,
}) => {
  const rowHeight = Number(settings?.rowHeight) || 45;
  const rowCount = flatData.length;

  const viewportHeight = Math.max(Number(height) || 0, rowHeight);
  const visibleCount = Math.ceil(viewportHeight / rowHeight);

  const baseIndex = Math.max(
    0,
    Math.min(
      Math.max(rowCount - 1, 0),
      Math.floor(scrollTop / rowHeight)
    )
  );

  const startIndex = Math.max(0, baseIndex - overscan);

  const endIndex = Math.min(
    rowCount,
    baseIndex + visibleCount + overscan
  );

  const visibleRows = useMemo(
    () => flatData.slice(startIndex, endIndex),
    [flatData, startIndex, endIndex]
  );

  const paddingTop = startIndex * rowHeight;

  const paddingBottom = Math.max(
    0,
    (rowCount - endIndex) * rowHeight
  );

  // +1 bo tree ma systemową kolumnę drzewa
  const colSpan = columnsSchema.getVisibleColumns().length + 1;

  return (
    <TableBody>
      {paddingTop > 0 && (
        <tr
          aria-hidden="true"
          style={{
            height: `${paddingTop}px`,
            padding: 0,
            border: 0,
          }}
        >
          <td
            colSpan={colSpan}
            style={{
              height: `${paddingTop}px`,
              padding: 0,
              border: 0,
            }}
          />
        </tr>
      )}

      {visibleRows.map((item, idx) => {
        const idField = settings?.idField ?? 'id';

        const rowId =
          item.row?.[idField] ??
          item.row?.id ??
          startIndex + idx;

        return (
          <PowerTableRow
            key={`tree-row-${rowId}`}
            row={item.row}
            columnsSchema={columnsSchema}
            rowRules={rowRules}
            settings={settings}
            editing={editing}
            actionsApi={actionsApi}
            parent="tree"
          />
        );
      })}

      {paddingBottom > 0 && (
        <tr
          aria-hidden="true"
          style={{
            height: `${paddingBottom}px`,
            padding: 0,
            border: 0,
          }}
        >
          <td
            colSpan={colSpan}
            style={{
              height: `${paddingBottom}px`,
              padding: 0,
              border: 0,
            }}
          />
        </tr>
      )}
    </TableBody>
  );
};

export default VirtualizedTreeBody;