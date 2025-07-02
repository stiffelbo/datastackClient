import React from 'react';
import { Box, Typography, Chip, Stack, IconButton, Tooltip } from '@mui/material';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import GroupOffIcon from '@mui/icons-material/GroupOff';
import SortIcon from '@mui/icons-material/Sort';
import CloseIcon from '@mui/icons-material/Close';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FunctionsIcon from '@mui/icons-material/Functions';

const PowerTableControl = ({ columnsSchema }) => {
  const {
    setAllVisible,
    sortModel,
    getGroupedCols,
    aggregationModel,
    toggleGroupBy,
    clearSort,
    clearGroupBy,
    clearAggregation,
  } = columnsSchema;


  const groupModel = getGroupedCols();

  const hasAnyActive =
    sortModel?.length > 0 || groupModel?.length > 0 || aggregationModel?.length > 0;

  const hiddenCount = columnsSchema?.columns?.filter(col => col.hidden).length;

  if (!hasAnyActive) return null;

  const clearAll = () => {
    clearSort();
    clearGroupBy();
    clearAggregation();
    setAllVisible();
  };

  return (
    <Box sx={{ px: 1, py: 0.5, backgroundColor: '#fafafa', borderBottom: '1px solid #ddd' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Box>
          {groupModel.length > 0 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">Grupowanie:</Typography>
              {groupModel.map((col) => {
                return (
                  <Chip
                    key={col.field}
                    label={`#${col.groupIndex + 1} ${col?.headerName || field}`}
                    size="small"
                    onDelete={() => toggleGroupBy(col.field)}
                    deleteIcon={<CloseIcon fontSize="small" />}
                  />
                );
              })}
            </Stack>
          )}
        </Box>

        <Stack direction="row" spacing={1}>
          {sortModel.length > 0 && (
            <Tooltip title="Wyczyść sortowanie">
              <IconButton color="primary" size="small" onClick={clearSort}>
                <SortIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {groupModel.length > 0 && (
            <Tooltip title="Wyczyść grupowanie">
              <IconButton color="primary" size="small" onClick={clearGroupBy}>
                <GroupOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {aggregationModel.length > 0 && (
            <Tooltip title="Wyczyść agregacje">
              <IconButton color="primary" size="small" onClick={clearAggregation}>
                <FunctionsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {hiddenCount > 0 && (
            <Tooltip title="Pokaż wszystkie kolumny">
                <IconButton color="primary" size="small" onClick={() => columnsSchema.setAllVisible(true)}>
                <ViewColumnIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            )}

          <Tooltip title="Resetuj wszystko">
            <IconButton color="primary" size="small" onClick={clearAll}>
              <ClearAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
};

export default PowerTableControl;
