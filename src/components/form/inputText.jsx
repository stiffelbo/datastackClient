import React from 'react';
import TextField from '@mui/material/TextField';

const InputText = ({
  name,
  label,
  value,
  title = '',
  multiline = false,
  rows = 1,
  defaultValue = '',
  placeholder = '',
  variant = 'outlined',
  inputProps = {},
  required = true,
  onChange,
  error = false,
  helpertext = '',
  size = 'small',
  disabled = false
}) => {
  if(multiline){
    return (
      <TextField
        id={name}
        name={name}
        label={label}
        value={value || defaultValue}      
        onChange={e => onChange(e.target.value)}
        error={error}
        helperText={helpertext}
        inputProps={inputProps}
        InputLabelProps={{ shrink: true }}
        size={size}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        title={title}
        variant={variant}
        fullWidth
        multiline
        rows={rows}
      />);
  }else{
    return (
      <TextField
        id={name}
        name={name}
        label={label}
        value={value || defaultValue}      
        onChange={e => onChange(e.target.value)}
        error={error}
        helperText={helpertext}
        inputProps={inputProps}
        InputLabelProps={{ shrink: true }}
        size={size}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        title={title}
        variant={variant}
        fullWidth
      />
    );
  }
  
};

export default InputText;

