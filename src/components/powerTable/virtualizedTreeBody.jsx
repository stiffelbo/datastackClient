// virtualizedTreeBody.jsx
import React, { useMemo, useRef } from 'react';
import { TableBody } from '@mui/material';
import PowerTableRow from './powerTableRow';

const VirtualizedTreeBody = ({
  flatData,
  columnsSchema,
  rowRules,
  settings,
  overscan = 10,
  height = 600,
  scrollTop = 0,
  editing,
  actionsApi,
}) => {
  const rowHeight = settings.rowHeight || 45;
  const rowCount = flatData.length;

  const viewportHeight = Math.max(height, rowHeight);
  const visibleCount = Math.ceil(viewportHeight / rowHeight);

  const rawBaseIndex = Math.floor(scrollTop / rowHeight);

  // (opcjonalnie możesz od razu dać histerezę jak w grouped:)
  const prevRef = useRef({ baseIndex: rawBaseIndex, scrollTop });
  let baseIndex = rawBaseIndex;
  const prev = prevRef.current;

  const baseDiff = Math.abs(rawBaseIndex - prev.baseIndex);
  const scrollDiff = Math.abs(scrollTop - prev.scrollTop);

  if (baseDiff === 1 && scrollDiff < rowHeight / 2) {
    baseIndex = prev.baseIndex;
  } else {
    prevRef.current = { baseIndex: rawBaseIndex, scrollTop };
    baseIndex = rawBaseIndex;
  }

  const startIndex = Math.max(0, baseIndex - overscan);
  const endIndex = Math.min(rowCount, baseIndex + visibleCount + overscan);

  const visibleRows = useMemo(
    () => flatData.slice(startIndex, endIndex),
    [flatData, startIndex, endIndex]
  );

  const paddingTop = startIndex * rowHeight;
  const paddingBottom = (rowCount - endIndex) * rowHeight;

  const visibleColumns = columnsSchema.getVisibleColumns();

  // console.log('tree startIndex:', startIndex, 'endIndex:', endIndex);

  return (
    <TableBody>
      {paddingTop > 0 && (
        <tr style={{ height: paddingTop }}>
          <td colSpan={visibleColumns.length} />
        </tr>
      )}

      {visibleRows.map((item, idx) => (
        <PowerTableRow
          key={`tree-row-${item.row?.[settings.idField ?? 'id'] ?? startIndex + idx}`}
          row={item.row}
          columnsSchema={columnsSchema}
          rowRules={rowRules}
          settings={settings}
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
