
import React from 'react';

import {
    Box,
    Paper,
    Stack,
    Typography,
    Avatar,
    Chip,
    Divider,
    Link,
} from '@mui/material';

import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

const formatNumber = (value, decimals = 2) => {
    if (value == null) return '—';

    return new Intl.NumberFormat('pl-PL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    }).format(Number(value));
};

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(String(value).replace(' ', 'T'));
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pl-PL');
};

const Metric = ({ label, value, unit, color = 'text.primary' }) => (
    <Box sx={{ minWidth: 110, flex: 1 }}>
        <Typography variant="caption" color="text.secondary">
            {label}
        </Typography>
        <Typography variant="subtitle1" fontWeight={700} color={color}>
            {formatNumber(value)} {unit}
        </Typography>
    </Box>
);

const Info = ({ label, children }) => (
    <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
            {label}
        </Typography>
        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {children ?? '—'}
        </Typography>
    </Box>
);

const WhStockResourceCard = ({ row = {} }) => {
    const unit = row.unit || 'szt.';

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={2}>

                {/* IDENTYFIKACJA ZASOBU */}
                <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                        src={row.img_url || undefined}
                        variant="rounded"
                        sx={{
                            width: 112,
                            height: 112,
                            bgcolor: 'action.hover',
                            border: '1px solid',
                            borderColor: 'divider',
                            '& img': { objectFit: 'contain' },
                        }}
                    >
                        <Inventory2OutlinedIcon sx={{ fontSize: 38 }} />
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={700}>
                            {row.label || 'Nieznany zasób'}
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                            sx={{ mt: 0.5 }}
                        >
                            <BusinessOutlinedIcon fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight={600}>
                                {row.contractorName || 'Brak kontrahenta'}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                            <Chip size="small" variant="outlined" label={`Partia PZ #${row.id}`} />
                            {row.reference && (
                                <Chip size="small" variant="outlined" label={row.reference} />
                            )}
                            {row.reference_url && (
                                <Chip
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    label="Otwórz zasób"
                                    component="a"
                                    href={row.reference_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    clickable
                                />
                            )}
                        </Stack>
                    </Box>
                </Stack>

                <Divider />

                {/* STAN MAGAZYNOWY */}
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Metric label="Stan globalny" value={row.qty_total} unit={unit} />
                    <Metric label="Dostępne" value={row.qty_available} unit={unit} color="success.main" />
                    <Metric label="Na produkcji" value={row.qty_in_production} unit={unit} color="warning.main" />
                    <Metric label="Odesłano WZ" value={row.qty_shipped} unit={unit} />
                </Stack>

                <Divider />

                {/* INFORMACJE O PARTII */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'repeat(2, minmax(0, 1fr))',
                            md: 'repeat(4, minmax(0, 1fr))',
                        },
                        gap: 2,
                    }}
                >
                    <Info label="Wartość stanu">
                        {formatNumber(row.stock_value)} {row.currency || 'PLN'}
                    </Info>

                    <Info label="Cena jednostkowa">
                        {formatNumber(row.unit_value)} {row.currency || 'PLN'}
                    </Info>

                    <Info label="Data przyjęcia">
                        {formatDate(row.occurred_at)}
                    </Info>

                    <Info label="Lokalizacja">
                        {row.locationName || (row.location_id ? `#${row.location_id}` : '—')}
                    </Info>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <LocalShippingOutlinedIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                        {row.shippingTitle || 'Brak nazwy przesyłki'}
                    </Typography>
                </Box>

                {(row.item_description || row.notes) && (
                    <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1 }}>
                        {row.item_description && (
                            <Typography variant="body2">
                                {row.item_description}
                            </Typography>
                        )}
                        {row.notes && (
                            <Typography variant="caption" color="text.secondary">
                                {row.notes}
                            </Typography>
                        )}
                    </Box>
                )}

            </Stack>
        </Paper>
    );
};

export default WhStockResourceCard;
