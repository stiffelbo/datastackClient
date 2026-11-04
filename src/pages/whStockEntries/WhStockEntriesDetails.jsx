import React from 'react';

import { Box } from '@mui/material';
import ApiLoader from '../../components/ApiLoader';

import WhStockEntriesDetailsContent from './WhStockEntriesDetailsContent';
import WhStockResourceCard from './WhStockResourceCard';

const WhStockEntriesDetails = ({ id, row, entity, rwd, dashboard }) => {

    return (
        <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <WhStockResourceCard row={row} />
            <ApiLoader
                entityName="whStockHistory"
                url="/wh_stock_entries/getHistory.php"
                params={{ stockId: id }}
                deps={[id]}
            >
                <WhStockEntriesDetailsContent />
            </ApiLoader>
        </Box>
    );
};

export default WhStockEntriesDetails;