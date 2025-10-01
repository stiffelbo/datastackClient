// FilterConfigurator.jsx
import React, { useState } from 'react';
import {
  Box, MenuItem, ListItemText, TextField, Button, IconButton, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const FilterConfigurator = ({ field, column, columnsSchema, onClose }) => {
  const filters = column.filters || [];

  const addFilter = (filter) => {
    columnsSchema.addFilter(field, filter);
  };

  const removeFilter = (index) => {
    columnsSchema.removeFilter(field, index);
  };

  // --- Render różnego UI zależnie od typu
  const renderFilterEditor = (filter, idx) => {
    switch (column.type) {
      case 'string':
        return (
          <Stack direction="row" gap={1} alignItems="center" key={idx}>
            <TextField
              size="small"
              label="zawiera"
              value={filter.value || ''}
              onChange={(e) => {
                const newFilters = [...filters];
                newFilters[idx] = { ...filter, type: 'textContains', value: e.target.value };
                columnsSchema.setFilters(field, newFilters);
              }}
            />
            <IconButton onClick={() => removeFilter(idx)} size="small"><DeleteIcon /></IconButton>
          </Stack>
        );
      case 'number':
        return (
          <Stack direction="row" gap={1} alignItems="center" key={idx}>
            <TextField
              size="small"
              label="min"
              type="number"
              value={filter.value ?? ''}
              onChange={(e) => {
                const newFilters = [...filters];
                newFilters[idx] = { ...filter, type: 'numberRange', value: e.target.value ? +e.target.value : null, value2: filter.value2 };
                columnsSchema.setFilters(field, newFilters);
              }}
            />
            <TextField
              size="small"
              label="max"
              type="number"
              value={filter.value2 ?? ''}
              onChange={(e) => {
                const newFilters = [...filters];
                newFilters[idx] = { ...filter, type: 'numberRange', value: filter.value, value2: e.target.value ? +e.target.value : null };
                columnsSchema.setFilters(field, newFilters);
              }}
            />
            <IconButton onClick={() => removeFilter(idx)} size="small"><DeleteIcon /></IconButton>
          </Stack>
        );
      case 'date':
        return (
          <Stack direction="row" gap={1} alignItems="center" key={idx}>
            <TextField
              size="small"
              type="date"
              value={filter.value || ''}
              onChange={(e) => {
                const newFilters = [...filters];
                newFilters[idx] = { ...filter, type: 'dateRange', value: e.target.value || null, value2: filter.value2 };
                columnsSchema.setFilters(field, newFilters);
              }}
            />
            <TextField
              size="small"
              type="date"
              value={filter.value2 || ''}
              onChange={(e) => {
                const newFilters = [...filters];
                newFilters[idx] = { ...filter, type: 'dateRange', value: filter.value, value2: e.target.value || null };
                columnsSchema.setFilters(field, newFilters);
              }}
            />
            <IconButton onClick={() => removeFilter(idx)} size="small"><DeleteIcon /></IconButton>
          </Stack>
        );
      case 'boolean':
        return (
          <MenuItem key={idx} onClick={() => removeFilter(idx)}>
            <ListItemText primary={`= ${String(filter.value)}`} />
          </MenuItem>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1, width: 400 }}>
      {filters.map((f, idx) => renderFilterEditor(f, idx))}
      <Button
        size="small"
        variant="outlined"
        onClick={() => {
          if (column.type === 'string') addFilter({ type: 'textContains', value: '' });
          if (column.type === 'number') addFilter({ type: 'numberRange', value: null, value2: null });
          if (column.type === 'date') addFilter({ type: 'dateRange', value: null, value2: null });
          if (column.type === 'boolean') addFilter({ type: 'equals', value: true });
        }}
      >
        Dodaj filtr
      </Button>
    </Box>
  );
};

export default FilterConfigurator;
