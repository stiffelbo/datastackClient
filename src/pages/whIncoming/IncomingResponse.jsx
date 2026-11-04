import React from 'react';
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { OpenInNew, Add } from '@mui/icons-material';
import { makeOperationLink, makeShippingLink } from './incomingUtils';

export default function IncomingResponse({ result, onReset }) {
    if (!result) return null;
    if (!result.ok) return <Alert severity="error" variant="outlined">{result.message || 'Nie udało się zapisać przyjęcia'}</Alert>;
    
    
    const shippingUrl = makeShippingLink({ id: result.shipping_id});
    const operationUrl = makeOperationLink({ id:result.operation_id});

    return <Paper variant="outlined" sx={{ p: 3, maxWidth: 750, mx: 'auto', my: 3 }}>
        <Alert severity="success" sx={{ mb: 2 }}>Przyjęcie zapisane pomyślnie</Alert>
        <Typography variant="h6" gutterBottom>Utworzone dokumenty</Typography>
        <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                <Typography>Przesyłka #{result.shipping_id ?? '—'}</Typography>
                {shippingUrl && <Button component="a" href={shippingUrl} target="_blank" rel="noopener noreferrer" size="small" endIcon={<OpenInNew />}>Otwórz przesyłkę</Button>}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                <Typography>Operacja PZ #{result.operation_id ?? '—'}</Typography>
                {operationUrl && <Button component="a" href={operationUrl} target="_blank" rel="noopener noreferrer" size="small" endIcon={<OpenInNew />}>Otwórz PZ</Button>}
            </Stack>
            {result.items_count != null && <Box><Chip size="small" color="success" variant="outlined" label={`Pozycji: ${result.items_count}`} /></Box>}
            {onReset && <Box><Button variant="contained" startIcon={<Add />} onClick={onReset}>Nowe przyjęcie</Button></Box>}
        </Stack>
    </Paper>;
}
