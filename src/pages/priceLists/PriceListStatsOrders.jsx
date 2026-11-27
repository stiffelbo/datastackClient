import React from 'react';

import { Box } from '@mui/material';

import PowerTable from '../../components/powerTable/powerTable';

const PriceListStatsOrders = ({ stats, height }) => {
    const { orders, ordersEntity, loading, actions } = stats;

    return (
        <Box sx={{ width: '100%', height: '100%', minHeight: 0 }}>
            <PowerTable
                entity="PriceListStatsOrders"
                data={orders}
                columnSchema={ordersEntity.schema?.columns}
                loading={loading}
                onRefresh={actions.refresh}
                height={height}
            />
        </Box>
    );
};

export default PriceListStatsOrders;