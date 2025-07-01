import React from 'react';
import TextField from '@mui/material/TextField';

const InputDate = ({ name, label, value, title, defaultValue = '', placeholder, variant = 'outlined', inputProps = {}, required = true, onChange, error, min, max, helpertext, size='small', disabled = false }) => {

  return (
    <TextField
      type={'date'}
      label={label}
      value={value ? value : defaultValue}
      name={name}
      error={error}
      helpertext={helpertext}
      onChange={e => onChange(e.target.value)}
      InputLabelProps={{shrink : true}}
      size={size}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      title={title}
      variant={variant}
      fullWidth
      inputProps={{
        min:min,
        max:max,
        ...inputProps
      }}
    />
  );
};

export default InputDate;
