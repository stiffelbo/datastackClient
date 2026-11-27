import React, { useState } from 'react';

import { Box, Alert, Divider } from '@mui/material';

import useEntity from '../../hooks/useEntity';

import PriceListStatsTopBar from './PriceListStatsTopBar';
import PriceListStatsOrders from './PriceListStatsOrders';
import PriceListStatsEnnoblings from './PriceListStatsEnnoblings';

import { buildEnnoblingStats } from './priceListStatsUtils';

const PriceListStats = ({ id, row, entity, rwd, dashboard }) => {
    const [view, setView] = useState('orders');

    const ordersEntity = useEntity({
        endpoint: 'product_order',
        entityName: 'PriceListStatsOrders',
        query: { price_list_id: id },
        readOnly: true,
    });

    const ennoblingsEntity = useEntity({
        endpoint: 'ennoblings',
        entityName: 'PriceListStatsEnnoblings',
        readOnly: true,
    });

    const orders = ordersEntity.rows ?? [];
    const ennoblings = ennoblingsEntity.rows ?? [];

    const loading = ordersEntity.loading || ennoblingsEntity.loading;

    // Agregacja danych
    const ennoblingStats = buildEnnoblingStats(orders, ennoblings);

    const summary = {
        ordersCount: orders.length,
        ennoblingsCount: ennoblingStats.length,
        qtyOrdered: orders.reduce(
            (sum, item) => sum + (Number(item.qty_ordered) || 0),
            0
        ),
    };

    const handleRefresh = async () => {
        await Promise.all([
            ordersEntity.refresh(),
            ennoblingsEntity.refresh(),
        ]);
    };

    const stats = {
        id,
        row,
        orders,
        ennoblings,
        ennoblingStats,
        ordersEntity,
        ennoblingsEntity,
        summary,
        loading,

        ui: {
            view,
            setView,
        },

        actions: {
            refresh: handleRefresh,
        },
    };

    const height = rwd.height - 250;

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
        }}>
            <PriceListStatsTopBar stats={stats} />

            <Divider />

            {(ordersEntity.error || ennoblingsEntity.error) && (
                <Alert severity="error">
                    Nie udało się pobrać danych statystycznych.
                </Alert>
            )}

            <Box sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
                {view === 'orders' && (
                    <PriceListStatsOrders
                        stats={stats}
                        height={height}
                    />
                )}

                {view === 'ennoblings' && (
                    <PriceListStatsEnnoblings
                        stats={stats}
                        height={height}
                    />
                )}
            </Box>
        </Box>
    );
};

export default PriceListStats;