import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const InputSelectObject = ({ name, label, value, title, defaultValue = '', placeholder = '', selectOptions, inputProps = {}, required = true, variant='outlined', size = 'small', color = 'primary', onChange, error, helpertext, disabled=false }) => {
  return (
    <FormControl fullWidth error={error} helpertext={helpertext}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        name={name}
        label={label}
        value={value ? value : defaultValue}
        color={color}          
        size={size}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        title={title}
        variant={variant}
        inputProps={{...inputProps}}
        onChange={e => onChange(e.target.value)}
      >
        <MenuItem key={'empty'} value={``} >
            {`--${label}--`}
        </MenuItem>
        {selectOptions.map((option) => (
          <MenuItem key={option.id} value={option.id} disabled={option.disabled} title={option.title}>
            {option.val || option.value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default InputSelectObject;
