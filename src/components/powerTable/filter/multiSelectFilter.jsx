import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, IconButton, Divider } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { amber } from '@mui/material/colors';
import { getUniqueOptions, applyFilters } from './utils';

const MultiSelectFilter = ({ field, data, value, onChange, id, columnsSchema }) => {
  const preFiltered = applyFilters({data, columnsSchema, omit: [id]});
  const opts = getUniqueOptions(preFiltered, field);
  const { include = [], exclude = [] } = value || {};

  const handleChange = (option, mode) => {
    const newVal = { include: [...include], exclude: [...exclude] };
    if (mode === 'include') {
      newVal.include = include.includes(option)
        ? include.filter(o => o !== option)
        : [...include, option];
    } else {
      newVal.exclude = exclude.includes(option)
        ? exclude.filter(o => o !== option)
        : [...exclude, option];
    }
    onChange(newVal);
  };

  const color = (include.length > 0 || exclude.length > 0) ? amber[100] : 'white';

  // 🔹 Grupowanie opcji
  const includedOpts = opts.filter(o => include.includes(o));
  const excludedOpts = opts.filter(o => exclude.includes(o) && !include.includes(o));
  const neutralOpts  = opts.filter(o => !include.includes(o) && !exclude.includes(o));

  const groupedOpts = [
    ...(includedOpts.length ? [{ label: '✅ Uwzględnione', items: includedOpts }] : []),
    ...(excludedOpts.length ? [{ label: '🚫 Wykluczone', items: excludedOpts }] : []),
    ...(neutralOpts.length ? [{ label: 'Pozostałe', items: neutralOpts }] : []),
  ];

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

        {groupedOpts.map((group, gi) => (
          <Box key={gi}>
            <Divider />
            <MenuItem disabled sx={{ fontWeight: 'bold', opacity: 0.8 }}>
              {group.label}
            </MenuItem>
            {group.items.map(option => (
              <MenuItem key={option} value={option}>
                <Box display="flex" alignItems="center">
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleChange(option, 'include'); }}
                    color={include.includes(option) ? 'primary' : 'default'}
                  >
                    <AddCircleOutlineIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleChange(option, 'exclude'); }}
                    color={exclude.includes(option) ? 'secondary' : 'default'}
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                  <Box ml={2}>{option}</Box>
                </Box>
              </MenuItem>
            ))}
          </Box>
        ))}
      </Select>
    </FormControl>
  );
};

export default MultiSelectFilter;
