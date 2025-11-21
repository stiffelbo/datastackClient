// virtualizedGroupedBody.jsx
import React, { useMemo, useRef } from 'react';
import { TableBody, TableRow, TableCell, Box, IconButton } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import PowerTableCell from './powerTableCell';
import PowerTableRow from './powerTableRow';
import ActionCell from './cell/actionCell';

const VirtualizedGroupedBody = ({
  flatData,
  columnsSchema,
  rowRules,
  settings,
  groupCollapseState,
  toggleCollapse,
  overscan = 10,
  height = 600,
  scrollTop = 0,
  actionsApi,
  editing,
}) => {
  const rowHeight = settings.rowHeight || 45;
  const rowCount = flatData.length;

  const viewportHeight = Math.max(height, rowHeight);
  const visibleCount = Math.ceil(viewportHeight / rowHeight);

  const rawBaseIndex = Math.floor(scrollTop / rowHeight);

  // --- HISTERZA NA BASEINDEX ---
  const prevRef = useRef({ baseIndex: rawBaseIndex, scrollTop });

  let baseIndex = rawBaseIndex;
  const prev = prevRef.current;

  const baseDiff = Math.abs(rawBaseIndex - prev.baseIndex);
  const scrollDiff = Math.abs(scrollTop - prev.scrollTop);

  // jeśli:
  // - baseIndex różni się tylko o 1
  // - i scrollTop prawie się nie zmienił (np. < pół wysokości rzędu)
  // to uznajemy, że to drganie layoutu i TRZYMAMY poprzedni baseIndex
  if (baseDiff === 1 && scrollDiff < rowHeight / 2) {
    baseIndex = prev.baseIndex;
  } else {
    // normalny, "prawdziwy" ruch scrolla → aktualizujemy pamięć
    prevRef.current = {
      baseIndex: rawBaseIndex,
      scrollTop,
    };
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

  return (
    <TableBody>
      {paddingTop > 0 && (
        <tr style={{ height: paddingTop }}>
          <td colSpan={visibleColumns.length} />
        </tr>
      )}

      {visibleRows.map((item, idx) => {
        if (item.type === 'group') {
          const open = !groupCollapseState[item.path];
          const groupRows = item.rows || []; // użyj rows z drzewa, nie filtruj po flatData

          return (
            <TableRow
              key={`group-${item.path}-${idx}`}
              sx={{ backgroundColor: '#f3f3f3', height: rowHeight }}
            >
              {visibleColumns.map((col) => {
                if (col.type === 'action') {
                  return (
                    <ActionCell
                      key={`group-${item.path}-${col.field}`}
                      column={col}
                      params={{}}
                      parent="group"
                      actionsApi={actionsApi}
                      cellSX={{}}
                      data={groupRows}
                    />
                  );
                }

                if (col.field === item.field) {
                  let displayValue = item.value;

                  if (col.input === 'select' && Array.isArray(col.options) && displayValue) {
                    const option = col.options.find((option) => {
                      if (typeof option === 'object') {
                        return +option.value === +item.value;
                      }
                      return false;
                    });
                    if (option) displayValue = option.label;
                  }

                  return (
                    <TableCell key={col.field}>
                      <Box sx={{ pl: item.level * 2, display: 'flex', alignItems: 'center' }}>
                        <IconButton size="small" onClick={() => toggleCollapse(item.path)}>
                          {open ? <ExpandMore /> : <ExpandLess />}
                        </IconButton>
                        {`${displayValue} (${item.rows?.length ?? 0})`}
                      </Box>
                    </TableCell>
                  );
                }

                if (item.aggregates?.[col.field] !== undefined) {
                  return (
                    <PowerTableCell
                      key={col.field}
                      value={item.aggregates[col.field]}
                      column={col}
                      columnsSchema={columnsSchema}
                      settings={settings}
                      parent="grouped"
                      actionsApi={actionsApi}
                    />
                  );
                }

                return <TableCell key={col.field} />;
              })}
            </TableRow>
          );
        }

        // zwykły wiersz danych
        return (
          <PowerTableRow
            key={`row-${item.row?.id ?? idx}`}
            row={item.row}
            columnsSchema={columnsSchema}
            rowRules={rowRules}
            settings={settings}
            actionsApi={actionsApi}
            parent="grouprow"
            editing={editing}
          />
        );
      })}

      {paddingBottom > 0 && (
        <tr style={{ height: paddingBottom }}>
          <td colSpan={visibleColumns.length} />
        </tr>
      )}
    </TableBody>
  );
};

export default VirtualizedGroupedBody;
