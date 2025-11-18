// virtualizedTreeBody.jsx
import React, { useMemo } from 'react';
import { TableBody } from '@mui/material';
import PowerTableRow from './powerTableRow';

const VirtualizedTreeBody = ({
  flatData,
  columnsSchema,
  rowRules,
  settings,
  rowHeight = 60,
  overscan = 20,
  height = 600,
  scrollTop = 0,
  editing,
  actionsApi
}) => {
  const visibleCount = Math.ceil(height / rowHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(flatData.length, startIndex + visibleCount + overscan * 2);

  const visibleRows = useMemo(
    () => flatData.slice(startIndex, endIndex),
    [flatData, startIndex, endIndex]
  );

  const paddingTop = startIndex * rowHeight;
  const paddingBottom = (flatData.length - endIndex) * rowHeight;

  const visibleColumns = columnsSchema.getVisibleColumns();

  return (
    <TableBody>
      {paddingTop > 0 && (
        <tr style={{ height: paddingTop }}>
          <td colSpan={visibleColumns.length} />
        </tr>
      )}

      {visibleRows.map((item, idx) => (
        <PowerTableRow
          key={`tree-row-${item.row?.id ?? startIndex + idx}`}
          row={item.row}
          columnsSchema={columnsSchema}
          rowRules={rowRules}
          settings={{ ...settings, rowHeight }}
          editing={editing}
          actionsApi={actionsApi}
          parent="tree"
        />
      ))}

      {paddingBottom > 0 && (
        <tr style={{ height: paddingBottom }}>
          <td colSpan={visibleColumns.length} />
        </tr>
      )}
    </TableBody>
  );
};

export default VirtualizedTreeBody;
