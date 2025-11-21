import React, { useMemo, useRef } from 'react';
import { TableBody } from '@mui/material';
import PowerTableRow from './powerTableRow';

const VirtualizedBody = ({
  data,
  columnsSchema,
  rowRules,
  settings,
  overscan = 10,
  height,
  scrollTop = 0,
  editing,
  actionsApi,
}) => {
  const rowHeight = settings.rowHeight || 45;
  const viewportHeight = Math.max(height, rowHeight);
  const visibleCount = Math.ceil(viewportHeight / rowHeight);

  const baseIndex = Math.floor(scrollTop / rowHeight);

  const prevBaseRef = useRef(baseIndex);
  let stableBase = baseIndex;

  if (Math.abs(baseIndex - prevBaseRef.current) === 1) {
    // malutka histereza – ignorujemy „drgnięcie” o 1
    stableBase = prevBaseRef.current;
  } else {
    prevBaseRef.current = baseIndex;
  }

  const startIndex = Math.max(0, stableBase - overscan);
  const endIndex = Math.min(
    data.length,
    stableBase + visibleCount + overscan
  );

  const visibleRows = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex]
  );

  const paddingTop = startIndex * rowHeight;
  const paddingBottom = (data.length - endIndex) * rowHeight;

  return (
    <TableBody>
      {paddingTop > 0 && (
        <tr style={{ height: paddingTop }}>
          <td colSpan={columnsSchema.getVisibleColumns().length} />
        </tr>
      )}

      {visibleRows.map((row, idx) => (
        <PowerTableRow
          key={row.id || startIndex + idx}
          row={row}
          columnsSchema={columnsSchema}
          rowRules={rowRules}
          settings={settings}
          editing={editing}
          actionsApi={actionsApi}
          parent="body"
        />
      ))}

      {paddingBottom > 0 && (
        <tr style={{ height: paddingBottom }}>
          <td colSpan={columnsSchema.getVisibleColumns().length} />
        </tr>
      )}
    </TableBody>
  );
};

export default VirtualizedBody;
