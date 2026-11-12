import React from 'react';

import NumismaticProducts from '../numismatics/NumismaticProducts';
import { Alert } from '@mui/material';

const WhStockProducts = ({ id, row = {}, entity, rwd, dashboard }) => {
    if(!id) return;
    const {reference, contractor_id, reference_id} = row;
    if(reference === 'numismatics' && contractor_id && reference_id){
        return <NumismaticProducts id={reference_id} contractor_id={contractor_id} rwd={rwd}/>
    }
    return <Alert severity='info'>Nie mam powiązanych produktów z referencją: {reference}</Alert>
}

export default WhStockProducts;