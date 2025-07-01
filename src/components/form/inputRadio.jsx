import React from 'react';
import { FormControlLabel, Grid, Button } from '@mui/material';

const InputRadio = ({ name, label = '', value, title = '', onChange, selectOptions = [], inputProps = {}, required=true, error=false, helpertext, size="small", labelPlacement="start", disabled = false }) => {

    const renderButtons = () => {
        if(!selectOptions.length) return;
        return <Grid container {...inputProps} m={2}>
            {selectOptions.map(option => {
                    if(option.value === value){
                        return <Grid key={option.value}><Button disabled={disabled} color="success" variant="contained" onClick={()=>onChange('')} title={option.title}>{option.value}</Button></Grid>
                    }else{
                        return <Grid key={option.value}><Button disabled={disabled} color="primary" onClick={()=>onChange(option.value)} title={option.title}>{option.value}</Button></Grid>
                    }
                }
            )}
        </Grid>
    };

    return (
        <FormControlLabel
            control={renderButtons()}
            label={label}
            labelPlacement={labelPlacement}
            error={error.toString()}
            helpertext={helpertext}
        />
    );
};

export default InputRadio;
