import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import PowerTable from '../../components/powerTable/powerTable';

const selectedColumns = [
    { field: 'label', headerName: 'Materiał', width: 350 },
    { field: 'qty_available', headerName: 'Dostępne', width: 120 },
    { field: 'qty', headerName: 'Do odesłania', editable: true, type: 'number', width: 145 },
    { field: 'unit', headerName: 'JM', width: 75 },
    { field: 'notes', headerName: 'Uwagi', editable: true, width: 240 },
];

export default function OutgoingContent({ outgoing, height = 500 }) {
    const { stockEntity, availableRows, items, handleSelectEntry, handleRemoveItem, handleEditItem } = outgoing;
    return <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography fontWeight={600}>Pozycje dostępne do odesłania</Typography>
            <Chip size="small" variant="outlined" label={`Wybrane: ${items.length}`} />
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1fr) minmax(0,0.9fr)' }, gap: 1, p: 1, minHeight: 0, overflow: 'auto' }}>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>Wybierz wpis magazynowy (dostępne ilości)</Typography>
                <PowerTable entityName="OutgoingStockEntries" columnSchema={stockEntity.schema?.columnSchema} data={availableRows} loading={stockEntity.loading} onRefresh={stockEntity.refresh} onSelect={handleSelectEntry} height={height} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>Wybrane — możesz zmniejszyć ilość do odesłania</Typography>
                <PowerTable entityName="OutgoingSelectedEntries" columnSchema={selectedColumns} data={items} onDelete={handleRemoveItem} onEdit={handleEditItem} height={height} />
            </Box>
        </Box>
    </Paper>;
}
