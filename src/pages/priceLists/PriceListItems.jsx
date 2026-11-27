import React from 'react';

import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import PowerTable from '../../components/powerTable/powerTable';

const PRICE_FIELDS = [
    'setup_price',
    'reorder_price',
    'unit_price_s',
    'unit_price_m',
    'unit_price_l'
];

const PriceListItems = ({ priceList, rwd }) => {
    const theme = useTheme();
    const { items, itemsEntity, busy } = priceList;

    const getRowStyles = (row) => {
        const missing = PRICE_FIELDS.filter(
            field => !(Number(row[field]) > 0)
        ).length;

        // Wszystkie ceny uzupełnione
        if (missing === 0) return {};

        // Intensywność zależna od liczby brakujących cen
        const ratio = missing / PRICE_FIELDS.length;
        const opacity = 0.02 + ratio * 0.18;
        const color = theme.palette.info.main;

        return {
            backgroundColor: alpha(color, opacity),
            '&:hover': {
                backgroundColor: alpha(color, opacity + 0.04),
            },
        };
    };

    return (
        <Box sx={{ width: '100%', height: '100%', minHeight: 0 }}>
            <PowerTable
                entity="PriceListItems"
                data={items}
                columnSchema={itemsEntity.schema?.columns}
                loading={busy}
                onRefresh={itemsEntity.refresh}
                onEdit={itemsEntity.updateField}
                onDelete={itemsEntity.remove}
                onBulkDelete={itemsEntity.removeMany}
                onBulkEdit={itemsEntity.updateMany}
                bulkEditFormSchema={itemsEntity.schema.bulkEditFormSchema}
                height={rwd.height - 250}
                getRowStyles={priceList.ui.indicateEmpty ? getRowStyles : null}
            />
        </Box>
    );
};

export default PriceListItems;