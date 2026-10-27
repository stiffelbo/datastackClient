import React from 'react';

import useEntity from '../../hooks/useEntity';
//Mui
import { Box } from '@mui/material';

import AddShift from '../whShifts/AddShift';

const WhShippingItemShift = ({id, row, entity, rwd, dashboard}) => {
    return <Box sx={{width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%'}}>
        <AddShift element={"shipping_item"} data={row} id={id}/>
    </Box>
}

export default WhShippingItemShift;