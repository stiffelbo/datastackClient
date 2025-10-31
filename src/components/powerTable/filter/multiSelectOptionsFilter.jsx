import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, IconButton, Divider } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { amber } from '@mui/material/colors';
import { applyFilters } from './utils';

const MultiSelectOptionsFilter = ({ field, data, value, onChange, id, columnsSchema }) => {
  const preFiltered = applyFilters({ data, columnsSchema, omit: [id] });
  const column = columnsSchema?.columns?.find(col => col.field === field) || {};
  const optionsMap = column.optionsMap;
  const options = column.options;

  const prefilteredValues = preFiltered.map(row => row[field]);
  const filteredOptions = options.filter(option => prefilteredValues.includes(option.value)); //ale powinny być

  //filter options and optionsMap by prefiltered to remain cascade filter;

  const { include = [], exclude = [] } = value || {};

  // helpery do bezpiecznych porównań ID (string/number)
  const keyOf = (v) => String(v);
  const contains = (arr, v) => arr?.some(x => keyOf(x) === keyOf(v));
  const remove = (arr, v) => (arr || []).filter(x => keyOf(x) !== keyOf(v));
  const addUnique = (arr, v) => (contains(arr, v) ? arr : [...(arr || []), v]);

  const handleChange = (option, mode) => {
    const next = { include: [...(include || [])], exclude: [...(exclude || [])] };

    if (mode === 'include') {
      // toggle w include
      next.include = contains(next.include, option)
        ? remove(next.include, option)
        : addUnique(next.include, option);

      // zdejmij z exclude jeśli był
      next.exclude = remove(next.exclude, option);
    } else {
      // toggle w exclude
      next.exclude = contains(next.exclude, option)
        ? remove(next.exclude, option)
        : addUnique(next.exclude, option);

      // zdejmij z include jeśli był
      next.include = remove(next.include, option);
    }

    onChange(next);
  };


  const color = (include.length > 0 || exclude.length > 0) ? amber[100] : 'white';

  return (
    <FormControl size="small" sx={{ width: 280, backgroundColor: color }}>
      <InputLabel>{field}</InputLabel>
      <Select
        multiple
        value={[]}
        renderValue={() =>
          include.length + exclude.length > 0
            ? `(${include.length} + ${exclude.length})`
            : 'Select'
        }
        MenuProps={{
          PaperProps: { style: { maxHeight: 500, width: 350 } }
        }}
      >
        <MenuItem onClick={() => onChange({ include: [], exclude: [] })}>
          Wyczyść
        </MenuItem>
        <Divider />
        {filteredOptions.map(option => {
          return <MenuItem key={option.value} value={option.value}>
            <Box display="flex" alignItems="center">
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); handleChange(option.value, 'include'); }}
                color={include.includes(option.value) ? 'primary' : 'default'}
              >
                <AddCircleOutlineIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); handleChange(option.value, 'exclude'); }}
                color={exclude.includes(option.value) ? 'secondary' : 'default'}
              >
                <RemoveCircleOutlineIcon />
              </IconButton>
              <Box ml={2}>{option.label}</Box>
            </Box>
          </MenuItem>
        })}
      </Select>
    </FormControl>
  );
};

export default MultiSelectOptionsFilter;
