import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  IconButton,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { operatorsByType } from './utils';
import MultiSelectFilter from './multiSelectFilter';

const Filter = ({ column, filter, data, onChange, onRemove, columnsSchema }) => {
  const { field, type } = column;
  const { op, value, id } = filter;

  const handleChange = (key, val) => {
    onChange({ ...filter, [key]: val });
  };

  // 🔹 Operator select
  const renderOperator = () => (
    <TextField
      select
      size="small"
      label="Operator"
      value={op}
      onChange={(e) => handleChange('op', e.target.value)}
      sx={{ minWidth: 140 }}
    >
      {operatorsByType[type || 'string'].map((o) => (
        <MenuItem key={o} value={o}>
          {o}
        </MenuItem>
      ))}
    </TextField>
  );

  // 🔹 Dispatcher po typie
  const renderValue = () => {
    switch (type) {
      case 'string':
        return renderStringValue();
      case 'number':
        return renderNumberValue();
      case 'date':
        return renderDateValue();
      case 'boolean':
        return renderBooleanValue();
      default:
        return (
          <Filter.ValueInput
            type="text"
            value={value}
            onChange={(val) => handleChange('value', val)}
          />
        );
    }
  };

  // --- RENDERERY PER TYPE ---

  const renderStringValue = () => {
    if (op === 'multiSelect') {
      return (
        <Filter.MultiSelect
          field={field}
          data={data}
          value={value || { include: [], exclude: [] }}
          onChange={(val) => handleChange('value', val)}
          id={id}
          columnsSchema={columnsSchema}
        />
      );
    }
    if (['isEmpty', 'notEmpty'].includes(op)) {
      return null;
    }
    return (
      <Filter.ValueInput
        type="text"
        value={value}
        onChange={(val) => handleChange('value', val)}
      />
    );
  };

  const renderNumberValue = () => {
    if (op === 'between') {
      return (
        <Filter.RangeInput
          type="number"
          value={value}
          onChange={(val) => handleChange('value', val)}
        />
      );
    }
    if (['isEmpty', 'notEmpty'].includes(op)) return null;
    return (
      <Filter.NumberInput
        value={value}
        onChange={(val) => handleChange('value', val)}
      />
    );
  };

  const renderDateValue = () => {
    if (op === 'between') {
      return (
        <Filter.RangeInput
          type="date"
          value={value}
          onChange={(val) => handleChange('value', val)}
        />
      );
    }
    if (['isEmpty', 'notEmpty', 'isPast', 'isFuture'].includes(op)) return null;
    return (
      <Filter.ValueInput
        type="date"
        value={value}
        onChange={(val) => handleChange('value', val)}
      />
    );
  };

  const renderBooleanValue = () => {
    if (['isEmpty', 'notEmpty'].includes(op)) return null;
    return (
      <Filter.BooleanSelect
        value={value}
        onChange={(val) => handleChange('value', val)}
      />
    );
  };

  // --- MAIN RETURN ---
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {renderOperator()}
      {renderValue()}
      <IconButton size="small" onClick={onRemove} color="error" fontSize={10}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default Filter;

/* ============================================================
   SUB-KOMPONENTY
   ============================================================ */

Filter.ValueInput = ({ type, value, onChange, label = 'Value' }) => (
  <TextField
    size="small"
    label={label}
    type={type}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
  />
);

Filter.NumberInput = ({ value, onChange, label = 'Value' }) => (
  <TextField
    size="small"
    type="number"
    label={label}
    value={value || ''}
    onChange={(e) => onChange(Number(e.target.value))}
  />
);

Filter.RangeInput = ({ type, value, onChange }) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <TextField
      size="small"      
      type={type}
      value={value?.min || ''}
      onChange={(e) => onChange({ ...value, min: e.target.value })}
      InputProps={{
            startAdornment: <span style={{ marginRight: 4, color: '#888' }}>Min:</span>
        }}
    />
    <TextField
      size="small"
      type={type}
      value={value?.max || ''}
      onChange={(e) => onChange({ ...value, max: e.target.value })}
    InputProps={{
            startAdornment: <span style={{ marginRight: 4, color: '#888' }}>Max:</span>
        }}
    />
  </Box>
);

Filter.BooleanSelect = ({ value, onChange }) => (
  <FormControl size="small" sx={{ minWidth: 120 }}>
    <InputLabel>Value</InputLabel>
    <Select
      value={value === true ? 'true' : value === false ? 'false' : ''}
      label="Value"
      onChange={(e) => onChange(e.target.value === 'true')}
    >
      <MenuItem value="true">True</MenuItem>
      <MenuItem value="false">False</MenuItem>
    </Select>
  </FormControl>
);

Filter.MultiSelect = MultiSelectFilter;
