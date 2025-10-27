import React, { useMemo } from 'react';
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
  rowHeight = 60,
  groupHeight = 60,
  overscan = 20,
  height = 600,
  scrollTop = 0,
  actionsApi
}) => {
  const visibleCount = Math.ceil(height / rowHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(flatData.length, startIndex + visibleCount + overscan * 2);

  const visibleRows = useMemo(() => flatData.slice(startIndex, endIndex), [flatData, startIndex, endIndex]);

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

      {visibleRows.map((item, idx) => {
        if (item.type === 'group') {
          const open = !groupCollapseState[item.path];
          const groupRows = flatData.filter(i => i.type === "row" && i.path.includes(item.path));
          return (
            <TableRow key={`group-${idx}`} sx={{ backgroundColor: '#f3f3f3', height : groupHeight }}>
              {visibleColumns.map((col) => {
                if(col.type === 'action'){
                  return <ActionCell 
                    key={`group-${idx}-${col.field}`}
                    column={col}
                    params={{}}
                    parent='group'
                    actionsApi={actionsApi}
                    cellSX={{}}
                    data={groupRows}
                  />
                }

                if (col.field === item.field) {
                  let displayValue = item.value;

                  if(col.input === 'select' && Array.isArray(col.options) && displayValue) {
                      const option = col.options.find(option => {
                          if(typeof option === 'object'){
                              return +option.value === +item.value;
                          }
                      });
                      if(option){
                          displayValue = option.label;
                      }
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
                      parent={'grouped'}
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
            key={`row-${idx}-${item.row?.id ?? idx}`}
            row={item.row}
            columnsSchema={columnsSchema}
            rowRules={rowRules}
            settings={{...settings, rowHeight: rowHeight}}
            actionsApi={actionsApi}
            parent="grouprow"
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
