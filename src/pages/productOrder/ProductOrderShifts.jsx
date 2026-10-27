import React from 'react';

import useEntity from '../../hooks/useEntity';
//Mui
import { Box } from '@mui/material';

import AddShift from '../whShifts/AddShift';

const ProductOrderShifts = ({ id, row, entity, rwd, dashboard }) => {
    const shiftEntity = useEntity({entityName : 'ProductOrderItemShift', endpoint: 'wh_shifts', query: {productOrderId : id}});
    return <Box sx={{width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%'}}>
        <AddShift element="product_order" data={row} id={id}/>
    </Box>
}

export default ProductOrderShifts;