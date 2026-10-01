import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, IconButton, Divider } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { amber } from '@mui/material/colors';
import { getUniqueOptions, applyFilters } from './utils';

const MultiSelectFilter = ({ field, data, value, onChange, id, columnsSchema }) => {
  const preFiltered = applyFilters({ data, columnsSchema, omit: [id] });
  const column =
    columnsSchema?.columns?.find(
      col => col.field === field
    ) ?? {};
  const opts = getUniqueOptions(
    preFiltered,
    column
  );
  const { include = [], exclude = [] } = value || {};

  const handleChange = (option, mode) => {
    let newInclude = [...include];
    let newExclude = [...exclude];

    if (mode === 'include') {
      const isActive = include.includes(option);

      if (isActive) {
        // + aktywny -> wracamy do neutralnego
        newInclude = newInclude.filter(o => o !== option);
      } else {
        // + włączony -> wyłączamy -
        newInclude = [...newInclude, option];
        newExclude = newExclude.filter(o => o !== option);
      }
    }

    if (mode === 'exclude') {
      const isActive = exclude.includes(option);

      if (isActive) {
        // - aktywny -> wracamy do neutralnego
        newExclude = newExclude.filter(o => o !== option);
      } else {
        // - włączony -> wyłączamy +
        newExclude = [...newExclude, option];
        newInclude = newInclude.filter(o => o !== option);
      }
    }

    onChange({
      include: newInclude,
      exclude: newExclude,
    });
  };

  const color = (include.length > 0 || exclude.length > 0) ? amber[100] : 'white';

  // 🔹 Grupowanie opcji
  const includedOpts = opts.filter(o => include.includes(o));
  const excludedOpts = opts.filter(o => exclude.includes(o) && !include.includes(o));
  const neutralOpts = opts.filter(o => !include.includes(o) && !exclude.includes(o));

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
