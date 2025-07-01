import React from 'react';
import TextField from '@mui/material/TextField';

const InputText = ({ name, label, title, placeholder = '', variant = 'outlined', inputProps = {}, required = true, onChange, error, helpertext, size="small", disabled = false }) => {
  return (
    <TextField
      name={name}
      type="password"
      label={label}
      onChange={e => onChange(e.target.value)}
      error={error}
      helpertext={helpertext}
      inputProps={{...inputProps}}
      InputLabelProps={{shrink : true}}
      size={size}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      title={title}
      variant={variant}
      fullWidth
    />
  );
};

export default InputText;
