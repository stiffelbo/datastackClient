import React, { useMemo } from 'react';
import { TableBody } from '@mui/material';
import PowerTableRow from './powerTableRow';

const VirtualizedBody = ({
  data,
  columnsSchema,
  rowRules,
  settings,
  rowHeight = 60,
  overscan = 20,
  height = 600,
  scrollTop = 0
}) => {
  const visibleCount = Math.ceil(height / rowHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(data.length, startIndex + visibleCount + overscan * 2);
  const visibleRows = useMemo(() => data.slice(startIndex, endIndex), [data, startIndex, endIndex]);

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
          settings={{ ...settings, rowHeight: rowHeight }}
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
