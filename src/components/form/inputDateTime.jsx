import React from 'react';
import TextField from '@mui/material/TextField';

const InputDateTime = ({ name, label, value, title, defaultValue = '', placeholder, required, variant='outlined', inputProps = {}, onChange, error, min, max, helpertext, size="small", disabled = false }) => {

  return (
    <TextField
      type={'datetime-local'}
      label={label}
      value={value ? value : defaultValue}
      name={name}
      error={error}
      helpertext={helpertext}
      onChange={e => onChange(e.target.value)}
      fullWidth
      size={size}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      title={title}
      variant={variant}
      inputProps={{
        min,
        max,
        ...inputProps
      }}
      InputLabelProps={{shrink : true}}
    />
  );
};

export default InputDateTime;
