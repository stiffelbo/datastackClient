import React from 'react';
import { Box, Button } from '@mui/material';

import Filter from './filter';

import { createFilter } from './utils';

const ColumnFilters = ({ data, columnsSchema, field, column, onClose }) => {
  const filters = column.filters || [];

  const handleChange = (id, newFilter) => {
    const updated = [...filters.filter(item => item.id !== id), newFilter];
    columnsSchema.setFilters(field, updated);
  };

  const handleAdd = () => {
    const newFilter = createFilter(column.field, column.type, )
    columnsSchema.setFilters(field, [...filters, newFilter]);
  };

  const handleRemove = (id) => {
    const updated = filters.filter((filter) => filter.id !== id);
    columnsSchema.setFilters(field, updated);
  };

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {filters.map((filter, idx) => (
        <Filter
          key={filter.id || idx}
          column={column}
          filter={filter}
          data={data}
          onChange={(newFilter) => handleChange(filter.id, newFilter)}
          onRemove={() => handleRemove(filter.id)}
        />
      ))}

      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button variant="outlined" size="small" onClick={handleAdd}>
          Dodaj filtr
        </Button>
        <Button variant="text" size="small" color="error" onClick={onClose}>
          Zamknij
        </Button>
      </Box>
    </Box>
  );
};

export default ColumnFilters;
