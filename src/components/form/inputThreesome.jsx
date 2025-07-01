import React from 'react';
import { FormControlLabel, IconButton } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const InputThreesome = ({ name, label = '', value, title = '', onChange, inputProps = {}, required=true, error=false, helpertext, size="small", labelPlacement="start", disabled = false }) => {
  
  const getIcon = ()=>{
    switch (value) {
        case true:
        case 'true':
        case 1:
        case '1':
            return<CheckCircleIcon />;
        case false:
        case 'false':
        case 0:
        case '0':
            return<HighlightOffIcon />;
        case null:
        case '':
            return<RadioButtonUncheckedIcon />;
        default:
            return<RadioButtonUncheckedIcon />;
      }
  }

  const handleChange = (e) => {
    e.preventDefault();
    if(value === null){
        onChange(true);
    }
    if(value === ''){
        onChange(true);
    }
    if(value === true){
        onChange(false);
    }
    if(value === 'true'){
        onChange(false);
    }
    if(value === false){
        onChange(true);
    }
    if(value === 'false'){
        onChange(true);
    }    
  }

  return (
    <FormControlLabel
      control={
        <IconButton 
            onClick={handleChange} 
            name={name}
            title={title}
            inputprops={inputProps}
            size={size}        
        >
          {getIcon()}
        </IconButton>
      }
      label={label}
      labelPlacement={labelPlacement}
      error={error.toString()}
      helpertext={helpertext}
    />
  );
};

export default InputThreesome;
