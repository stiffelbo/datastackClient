import React from 'react';
import TextField from '@mui/material/TextField';

const InputEmail = ({ name, label, title, value, defaultValue = '', placeholder, required = true, variant = 'outlined',onChange, error, helpertext, size="small", disabled = false }) => {
  return (
    <TextField
      id={name}
      name={name}
      label={label}
      type='email'      
      value={value ? value : defaultValue}
      error={error}
      helpertext={helpertext}
      InputLabelProps={{shrink : true}}
      size={size}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      title={title}
      variant={variant}
      fullWidth
      onChange={e => onChange(e.target.value)}
    />
  );
};

export default InputEmail;
