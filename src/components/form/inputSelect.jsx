import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const InputSelect = ({ name, label, value, title, defaultValue = '', placeholder = '', selectOptions, inputProps = {}, required, size='small', variant='outlined', onChange, error, helpertext, disabled = false }) => {
  return (
    <FormControl fullWidth error={error} helpertext={helpertext}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        name={name}
        label={label}
        value={value ? value : defaultValue}       
        size={size}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        title={title}
        variant={variant}
        inputProps={{...inputProps}}
        onChange={e => onChange(e.target.value)}
      >
        {selectOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default InputSelect;
