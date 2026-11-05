
import React from 'react';

import useEntity from '../../hooks/useEntity';
import PowerTable from '../../components/powerTable/PowerTable';

import { Box, Stack, TextField, Typography } from '@mui/material';

import ProductOrderSelectList from '../productOrder/ProductOrderSelectList';

const ProductOrderShifts = ({ id, row, entity, rwd, dashboard }) => {
    const shiftEntity = useEntity({
        endpoint: 'wh_shifts',
        entityName: 'WhProductOrderShifts',
        schemaQuery: { product_order_id: id },
        query: { product_order_id: id },
    });

    const getRowStyles = (row) => {
        const side = Number(row.balance_side);
        const hasReference = row.reference_no != null && String(row.reference_no).trim() !== '';

        if (side === -1) {
            return { backgroundColor: 'rgba(33, 150, 243, 0.055)' };
        }

        if (side === 1 && hasReference) {
            return { backgroundColor: 'rgba(76, 175, 80, 0.075)' };
        }

        if (side === 1) {
            return { backgroundColor: 'rgba(255, 152, 0, 0.075)' };
        }

        return {};
    };

    return (
        <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <PowerTable
                entity={"WhStockEntriesShifts"}
                data={shiftEntity.rows}
                columnSchema={shiftEntity.schema?.columns}
                loading={shiftEntity.loading}
                onRefresh={shiftEntity.refresh}
                height="100%"
                getRowStyles={getRowStyles}
            />
        </Box>
    );
};

export default ProductOrderShifts;
