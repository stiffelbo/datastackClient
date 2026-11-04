import React from 'react';

//Mui
import { Box } from '@mui/material';

import useEntity from '../../hooks/useEntity';
import PowerTable from '../../components/powerTable/powerTable';

const entityName = "WhInventoryOperationStockEntries";
const WhInventoryOperationItems = ({id, row, entity, rwd, dashboard}) => {
    const itemsEntity = useEntity({endpoint: 'wh_stock_entries', entityName, query: {operation_id : id}, schemaQuery: {operation_id : id}});    
    return <Box sx={{width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%'}}>
        <PowerTable 
            entityName={entityName}
            data={itemsEntity.rows}
            loading={itemsEntity.loading}
            columnSchema={itemsEntity?.schema?.columnSchema}
            height={rwd.height - 126}        
        />
    </Box>
}

export default WhInventoryOperationItems;