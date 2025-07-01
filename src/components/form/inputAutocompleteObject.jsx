import React from 'react';
import {TextField, Autocomplete, MenuItem} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

const InputAutocompleteObject = ({ label, value, title, defaultValue = {}, placeholder = '', selectOptions, required = true,   onChange, error, helpertext, size = 'small', disabled = false}) => {

    return (
        <Autocomplete
          options={selectOptions}
          fullWidth
          autoHighlight
          size={size}
          error={error}
          helpertext={helpertext}
          value={value ? value : defaultValue}
          getOptionLabel={(option) => option.val}
          disableClearable={true}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          title={title}
          renderOption={(props, option) => {
            if(!option.disabled){
                return (<MenuItem 
                            component="li" 
                            key={option.id} 
                            onClick={()=>onChange(option)}
                            sx={{padding: '0.5em', cursor: 'pointer'}}
                        >
                    {option.val}
                </MenuItem>);
            }else{
                return (<MenuItem 
                            component="li" 
                            key={option.id}
                            sx={{padding: '0.5em', cursor: 'not-allowed'}}
                        >
                    {option.val}
                </MenuItem>);
            }            
          }}
          renderInput={(params) => {
            const handleClear = () => {
              onChange(null);
            };
            return (
              <TextField
                {...params}
                label={label}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {params.InputProps.endAdornment}
                      {value && (
                        <ClearIcon
                          sx={{ cursor: 'pointer' }}
                          onClick={handleClear}
                        />
                      )}
                    </>
                  )
                }}
              />
            );
          }}
        />
    );
};

export default InputAutocompleteObject;
