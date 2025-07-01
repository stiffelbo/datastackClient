import React, {useState, useEffect} from 'react';
import {toast} from 'react-toastify';

//Mui
import {Box, Grid, IconButton} from '@mui/material';

//Icons
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import FunctionsIcon from '@mui/icons-material/Functions';

//Comp
import InputNumber from './inputNumber';
import InputDateTime from './inputDateTime';
//Utils
import { hoursToDecimal } from '../../../utils/hoursToDecimal';

function addHoursMinutes(datetime, hours, min) {
    const date = new Date(datetime);
    const newDate = new Date(date.getTime() + (hours * 60 * 60 * 1000) + (min * 60 * 1000));
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1;
    const day = newDate.getDate();
    const hour = newDate.getHours();  
    const minutes = newDate.getMinutes();  
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}T${hour < 10 ? '0' + hour : hour}:${minutes < 10 ? '0' + minutes : minutes}`;
}

function decimalToHoursMinutes(decimalNumber) {
    const hours = Math.floor(decimalNumber);
    const minutes = Math.round((decimalNumber - hours) * 60);
  
    return { hours, minutes };
}

function getNowDate(){
  const nowDate = new Date();
  const year = nowDate.getFullYear();
  const month = nowDate.getMonth() + 1;
  const day = nowDate.getDate();
  const hour = nowDate.getHours();  
  const minutes = nowDate.getMinutes();

  return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}T${hour < 10 ? '0' + hour : hour}:${minutes < 10 ? '0' + minutes : minutes}`;
}

const InputTime = ({onChange, value = 0, label, disabled = false, timeOnly = false}) => {
  const [start, setStart] = useState(getNowDate());
  const [end, setEnd] = useState("");
  const [hours, setHours] = useState(value ? decimalToHoursMinutes(value)['hours'] : 0);
  const [minutes, setMinutes] = useState(value ? decimalToHoursMinutes(value)['minutes'] : 0);
  const [timeDecimal, setTimeDecimal] = useState(0);
  const [showTime, setShowTime] = useState(value ? true : false);

  useEffect(()=>{
    if(timeOnly){
        onChange(timeDecimal);
    }else{
        onChange({start, end, timeDecimal});
    }
  },[start, end, hours, minutes]);

  const handleStartChange = value => {
    setStart(value);
    if (!end) {
      setEnd(value);
    } else {
      const startDateTime = new Date(value);
      const endDateTime = new Date(end);
      const totalTimeInMinutes = (endDateTime - startDateTime) / (1000 * 60);
      const totalHours = Math.floor(totalTimeInMinutes / 60);
      const totalMinutes = totalTimeInMinutes % 60;
      setHours(totalHours);
      setMinutes(totalMinutes);
      setTimeDecimal(hoursToDecimal(totalHours, totalMinutes));
    }
  };

  const handleEndChange = value => {
    setEnd(value);
    const startDateTime = new Date(start);
    const endDateTime = new Date(value);
    const totalTimeInMinutes = (endDateTime - startDateTime) / (1000 * 60);
    const totalHours = Math.floor(totalTimeInMinutes / 60);
    const totalMinutes = totalTimeInMinutes % 60;
    setHours(totalHours);
    setMinutes(totalMinutes);
    setTimeDecimal(hoursToDecimal(totalHours, totalMinutes));
  };

  const handleHoursChange = value => {
    setHours(value);
    setTimeDecimal(hoursToDecimal(value, minutes));
    const endDateTime = addHoursMinutes(start, value, minutes);  
    setEnd(endDateTime);
  };

  const handleMinutesChange = value => {
    setMinutes(value);
    setTimeDecimal(hoursToDecimal(hours, value));
    const endDateTime = addHoursMinutes(start, hours, value);  
    setEnd(endDateTime);
  };
  
  const renderStartEnd = () => {
    const endDisabled = start ? false : true;   
    return (
        <Grid container>
            <Grid item md={6}>
                <InputDateTime 
                    label="Start"
                    value={start}
                    onChange={val => handleStartChange(val)}
                />
            </Grid>
            <Grid item md={6}>
                <InputDateTime 
                    label="Koniec"
                    value={end}
                    onChange={val => handleEndChange(val)}
                    disabled={endDisabled}
                />
            </Grid>
        </Grid>);
  }

  const renderHoursMinutes = () => {
    const valueHours = hours ? hours : 0;
    const valueMinutes = minutes ? minutes : 0;
    return (
        <Grid container>
            <Grid item md={6}>
                <InputNumber 
                    label="Godziny"
                    value={valueHours}
                    onChange={val => handleHoursChange(val)}
                    step={1}
                    min={0}
                    max={12}
                    inputProps={{style: {textAlign: 'center'}}}
                />
            </Grid>
            <Grid item md={6}>
                <InputNumber 
                    label="Minuty"
                    value={valueMinutes}
                    onChange={val => handleMinutesChange(val)}
                    step={1}
                    min={0}
                    max={59}
                    inputProps={{style: {textAlign: 'center'}}}
                />
            </Grid>
        </Grid>);
    }

  const renderTimeWidget = () => {
      const icon = showTime ? <AccessAlarmsIcon /> : <FunctionsIcon />;
      const button = <IconButton onClick={()=>{setShowTime(!showTime)}} >{icon}</IconButton>;

      if(timeOnly){
        return renderHoursMinutes();
      }

      return <Grid container spacing={1}>
          <Grid item md={10}>
              {showTime && renderHoursMinutes()}
              {!showTime && renderStartEnd()}
          </Grid>
          <Grid item md={2}>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{button}</Box>
          </Grid>
      </Grid>
  }

  return (
    <Box sx={{width: '100%'}}>
      {renderTimeWidget()}   
    </Box>
  );
};

export default InputTime;