import React from 'react';
import { FormControlLabel, FormHelperText, FormControl, Switch } from '@mui/material';

const InputSwitch = ({
  name,
  label = '',
  value,
  title = '',
  placeholder = '',
  variant = 'outlined',
  required = false,
  inputProps = {},
  color = 'primary',
  onChange,
  error = '',
  helpertext = '',
  labelPlacement = 'end',
  size = 'small',
  disabled = false,
}) => {
  // Helper function to normalize value to boolean
  const getChecked = (val) => {
    const result =  val === true || val === '1' || val === 1 || val === 'true';
    return result;
  };

  // Handle switch change
  const handleChange = (event) => {
    const checkedValue = event.target.checked ? '1' : '0'; // Normalize to '1' or '0'
    onChange(checkedValue);
  };

  return (
    <FormControl error={!!error} component="fieldset" disabled={disabled}>
      <FormControlLabel
        control={
          <Switch
            checked={getChecked(value)} // Ensure proper handling of all value types
            onChange={handleChange}
            name={name}
            color={color}
            size={size}
            disabled={disabled}
            inputProps={{ 'aria-label': label, placeholder, title, variant, ...inputProps }} // Consolidating all input props
          />
        }
        label={label}
        labelPlacement={labelPlacement}
      />
      {/* Conditionally render helper text if there's an error or helper text provided */}
      {error && <FormHelperText>{error}</FormHelperText>}
      {helpertext && !error && <FormHelperText>{helpertext}</FormHelperText>}
    </FormControl>
  );
};

export default InputSwitch;
