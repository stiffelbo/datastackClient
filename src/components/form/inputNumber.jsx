import React from 'react';
import TextField from '@mui/material/TextField';

const InputNumber = ({ 
  name, 
  label, 
  value, 
  title, 
  defaultValue = '', 
  placeholder = '', 
  variant = 'outlined', 
  required = true, 
  inputProps = {}, 
  onChange, 
  error, 
  helpertext, 
  step = 1, 
  min, 
  max, 
  size = 'small', 
  disabled = false 
}) => {
  return (
    <TextField
      name={name}
      label={label}
      type="number"
      value={value ? value : defaultValue}
      onChange={e => onChange(e.target.value)}
      error={error}
      helpertext={helpertext}      
      size={size}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      variant={variant}
      inputProps={{ 
        step, 
        min, 
        max, 
        title,
        ...inputProps 
      }}
      InputLabelProps={{ shrink: true }}
      fullWidth
    />
  );
};

export default InputNumber;
