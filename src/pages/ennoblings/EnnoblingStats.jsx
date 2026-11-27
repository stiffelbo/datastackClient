import React from 'react';

import useEntity from '../../hooks/useEntity';
import PowerTable from '../../components/powerTable/PowerTable';

import { Box } from '@mui/material';

const EnnoblingStats = ({ id, row, entity, rwd, dashboard }) => {
    const code = row?.code;

    const orderEntity = useEntity({
        endpoint: 'product_order',
        entityName: 'EnnoblingProductOrders',
        query: { code },
    });

    return (
        <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <PowerTable
                entity="EnnoblingItemProductOrders"
                data={orderEntity.rows}
                columnSchema={orderEntity.schema?.columns}
                loading={orderEntity.loading}
                onRefresh={orderEntity.refresh}
                height="100%"
            />
        </Box>
    );
};

export default EnnoblingStats;