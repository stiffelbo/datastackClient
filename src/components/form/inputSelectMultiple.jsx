import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const InputSelectMultiple = ({ name, label, value = [], title = '', defaultValue, placeholder = '', variant='outlined', required=false, selectOptions=[], inputProps = {}, onChange, error = false, helpertext = '', size = 'small', disabled = false }) => {
  return (
    <FormControl fullWidth error={error} helpertext={helpertext}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        name={name}
        label={label}
        value={value ? value : []}
        multiple         
        size={size}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        title={title}
        variant={variant}
        inputProps={{...inputProps}}
        onChange={e => onChange(e.target.value)}
      >
        <MenuItem key={name} name={name} value="">{label}</MenuItem>
        {selectOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default InputSelectMultiple;
