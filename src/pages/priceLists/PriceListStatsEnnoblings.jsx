import React from 'react';

import { Box } from '@mui/material';

import PowerTable from '../../components/powerTable/powerTable';

const STATS_COLUMNS = [
    {
        field: 'orders_count',
        headerName: 'Liczba zleceń',
        type: 'number',
        width: 110,
        aggregationFn: 'sum',
        editable: false,
    },
    {
        field: 'usage_percent',
        headerName: 'Udział [%]',
        type: 'number',
        width: 100,
        editable: false,
    },
    {
        field: 'qty_ordered',
        headerName: 'Nakład zamówiony',
        type: 'number',
        width: 140,
        aggregationFn: 'sum',
        editable: false,
    },
    {
        field: 'qty_done',
        headerName: 'Nakład wykonany',
        type: 'number',
        width: 140,
        aggregationFn: 'sum',
        editable: false,
    },
    {
        field: 'avg_qty_ordered',
        headerName: 'Średni nakład',
        type: 'number',
        width: 120,
        editable: false,
    },
];

const BASE_FIELDS = [
    'id',
    'name',
    'code',
    'type',
    'side',
    'price_list_name_pl',
    'price_list_name_en',
    'product_definition_id',
    'qty_discount',
];

const PriceListStatsEnnoblings = ({ stats, height }) => {
    const {
        ennoblingStats,
        ennoblingsEntity,
        loading,
        actions,
    } = stats;

    const baseColumns = (ennoblingsEntity.schema?.columns ?? [])
        .filter(column => BASE_FIELDS.includes(column.field))
        .map(column => ({
            ...column,
            editable: false,
            bulkEditable: false,
        }));

    const columns = [
        ...baseColumns,
        ...STATS_COLUMNS,
    ];

    return (
        <Box sx={{ width: '100%', height: '100%', minHeight: 0 }}>
            <PowerTable
                entity="PriceListStatsEnnoblings"
                data={ennoblingStats}
                columnSchema={columns}
                loading={loading}
                onRefresh={actions.refresh}
                height={height}
            />
        </Box>
    );
};

export default PriceListStatsEnnoblings;