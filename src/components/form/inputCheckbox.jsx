import React from 'react';
import { FormControlLabel, Checkbox } from '@mui/material';

const InputCheckbox = ({ 
  name, 
  label = '', 
  value, 
  title = '', 
  onChange, 
  inputProps = {}, 
  required = true, 
  error = false, 
  helpertext, 
  size = "small", 
  labelPlacement = "start", 
  disabled = false 
}) => {
  const handleChange = (event) => {
    onChange(event.target.checked);
  };

  const getChecked = (val) => {
    return val === true || val === '1' || val === 1;
  };

  const noVal = value === '' ? ' (null)' : '';

  return (
    <div title={title}> {/* Apply the title here */}
      <FormControlLabel
        control={
          <Checkbox
            checked={getChecked(value)}
            onChange={handleChange}
            name={name}
            color="primary"
            size={size}
            disabled={disabled}
            required={required}
            inputProps={{ ...inputProps }}
          />
        }
        label={label + noVal}
        labelPlacement={labelPlacement}
        helpertext={helpertext}
      />
    </div>
  );
};

export default InputCheckbox;
