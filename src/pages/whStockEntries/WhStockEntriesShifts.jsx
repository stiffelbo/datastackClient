
import React from 'react';

import useEntity from '../../hooks/useEntity';
import PowerTable from '../../components/powerTable/PowerTable';

import { Box, Stack, TextField, Typography } from '@mui/material';

import ProductOrderSelectList from '../productOrder/ProductOrderSelectList';

const WhStockEntriesShifts = ({ id, row, entity, rwd, dashboard }) => {
    const shiftEntity = useEntity({
        endpoint: 'wh_shifts',
        entityName: 'WhStockEntryShifts',
        schemaQuery: { source_stock_entry_id: id },
        query: { source_stock_entry_id: id },
    });

    return (
        <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <PowerTable 
                entity={"WhStockEntriesShifts"}
                data={shiftEntity.rows}
                loading={shiftEntity.loading}
                onRefresh={shiftEntity.refresh}
            />
        </Box>
    );
};

export default WhStockEntriesShifts;
