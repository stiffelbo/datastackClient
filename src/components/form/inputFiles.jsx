import React from 'react';
import { Input } from '@mui/material';

const InputFiles = ({ onChange, inputProps = {}, multiple = false, title, required, size='small', variant='outlined', placeholder = '', disabled = false, error = false }) => {
  return (
    <Input
      type="file"
      onChange={e => onChange(e.target.files)}
      multiple={multiple}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      title={title}
      variant={variant}
      size={size}
      inputProps={{...inputProps}}
      error={error}
    />
  );
};

export default InputFiles;
