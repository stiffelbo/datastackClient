import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import { DragIndicator } from '@mui/icons-material';

const SettingsColumnsConfigurator = ({
  columnsSchema,
  entityName = 'default',
  presetName = 'defaultPreset',
  width = 800,
  height = 500,
}) => {
  const columns = columnsSchema.columns;

  const [dragIndex, setDragIndex] = useState(null);

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (dragIndex !== null && dragIndex !== dropIndex) {
      columnsSchema.reorderColumn(dragIndex, dropIndex);
    }
    setDragIndex(null);
  };

  const handleFieldChange = (field, key, value) => {
    columnsSchema.updateField(field, { [key]: value });
  };

  const GRID_TEMPLATE = '30px 150px 120px 90px 90px 1fr';

  return (
    <Box sx={{ width, height, overflow: 'auto', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Preset kolumn: ({presetName})
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: GRID_TEMPLATE,
          gap: 1,
          mb: 1,
          fontWeight: 'bold',
        }}
      >
        <span></span>
        <span>Nazwa</span>
        <span>Typ</span>
        <span>Widoczna</span>
        <span>Grupuj</span>
        <span>Agregacja</span>
      </Box>

      <Divider sx={{ mb: 1 }} />

      <Stack spacing={1}>
        {columns.map((col, index) => (
          <Box
            key={col.field}
            sx={{
              display: 'grid',
              gridTemplateColumns: GRID_TEMPLATE,
              alignItems: 'center',
              gap: 1,
              p: 1,
              borderRadius: 1,
              backgroundColor: col.hidden ? '#f9f9f9' : '#fff',
              border: '1px solid #eee',
              boxShadow: dragIndex === index ? '0 0 0 2px #1976d2 inset' : 'none',
            }}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
          >
            {/* Drag icon */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <DragIndicator fontSize="small" sx={{ cursor: 'grab' }} />
            </Box>

            {/* Header name */}
            <TextField
              size="small"
              value={col.headerName || col.field}
              onChange={(e) => handleFieldChange(col.field, 'headerName', e.target.value)}
              title={col.field}
            />

            {/* Type */}
            <Select
              size="small"
              value={col.type || 'string'}
              onChange={(e) => handleFieldChange(col.field, 'type', e.target.value)}
            >
              {['string', 'number', 'date', 'boolean'].map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>

            {/* Visible Tutaj lepszy togle icon button z oczkiem*/}
            <Checkbox
              checked={!col.hidden}
              onChange={(e) => handleFieldChange(col.field, 'hidden', !e.target.checked)}
            />

            {/* GroupBy tutaj toggle button z grupką*/}
            <Checkbox
              checked={!!col.groupBy}
              onChange={(e) => handleFieldChange(col.field, 'groupBy', e.target.checked)}
            />

            {/* Aggregation tutaj jakaś ikonka functions przed selectem dobrze spiete jakimś form group czy czymś takim */}
            <Select
              size="small"
              value={col.aggregationFn || ''}
              onChange={(e) => handleFieldChange(col.field, 'aggregationFn', e.target.value || null)}
              displayEmpty
            >
                {/* dynamiczny render z tablicy a ta tablica to własnie z jakiegoś utilsa do tworzenia kolumn */}
              <MenuItem value="">-</MenuItem>
              <MenuItem value="sum">sum</MenuItem>
              <MenuItem value="avg">avg</MenuItem>
              <MenuItem value="min">min</MenuItem>
              <MenuItem value="max">max</MenuItem>
              <MenuItem value="count">count</MenuItem>
              <MenuItem value="countDistinct">countDistinct</MenuItem>
              <MenuItem value="empty">empty</MenuItem>
              <MenuItem value="notEmpty">notEmpty</MenuItem>
            </Select>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default SettingsColumnsConfigurator;
