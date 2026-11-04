
import React from 'react';

import {
    Alert,
    Avatar,
    Box,
    Chip,
    List,
    ListItemButton,
    Stack,
    Typography,
} from '@mui/material';

import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const formatQty = (value) =>
    new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 }).format(Number(value) || 0);

const formatDate = (value) =>
    value ? value.slice(0, 10).split('-').reverse().join('.') : '—';

const ProductOrderSelectList = ({
    productOrders = [],
    onSelect,
    selected,
}) => {
    const selectedId = typeof selected === 'object' ? selected?.id : selected;
    if (!Array.isArray(productOrders)) {
        console.error(productOrders);
        return <Alert severity='error'>Niepoprawna struktura danych projektów</Alert>
    }
    return (
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {productOrders.map((order) => {
                const isSelected = String(selectedId) === String(order.id);

                const qtyOrdered = Number(order.qty_ordered) || 0;
                const qtyIssued = Number(order.qty_issued) || 0;
                const qtyReceived = Number(order.qty_received) || 0;

                const qtyOnProduction = qtyIssued - qtyReceived;
                const qtyToIssue = Math.max(0, qtyOrdered - qtyOnProduction);

                const isOverIssued = qtyOnProduction > qtyOrdered;
                const isFullyIssued = qtyOrdered > 0 && qtyOnProduction === qtyOrdered;

                const qtyColors = isOverIssued
                    ? { bg: 'rgba(237, 108, 2, 0.08)', border: 'rgba(237, 108, 2, 0.25)', text: 'warning.dark' }
                    : isFullyIssued
                        ? { bg: 'rgba(46, 125, 50, 0.07)', border: 'rgba(46, 125, 50, 0.22)', text: 'success.dark' }
                        : { bg: 'action.hover', border: 'divider', text: 'text.primary' };
                return (
                    <ListItemButton
                        key={order.id}
                        selected={isSelected}
                        onClick={() => onSelect?.(order)}
                        sx={{
                            p: 1,
                            border: '1px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            borderRadius: 1.5,
                            alignItems: 'flex-start',
                            bgcolor: isSelected ? 'action.selected' : 'background.paper',
                            transition: 'background-color 0.15s, border-color 0.15s',
                            '&.Mui-selected': {
                                bgcolor: 'action.selected',
                            },
                            '&.Mui-selected:hover': {
                                bgcolor: 'action.selected',
                            },
                            '&:hover': {
                                borderColor: 'primary.light',
                            },
                        }}
                    >
                        <Stack direction="row" spacing={1.5} sx={{ width: '100%', minWidth: 0 }}>
                            <Avatar
                                src={order.profileUrl || undefined}
                                variant="rounded"
                                sx={{
                                    width: 64,
                                    height: 64,
                                    flexShrink: 0,
                                    bgcolor: 'action.hover',
                                    '& img': { objectFit: 'contain' },
                                }}
                            >
                                <Inventory2OutlinedIcon color="action" />
                            </Avatar>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                {/* Poziom 1: produkt */}
                                <Stack
                                    direction="row"
                                    alignItems="flex-start"
                                    justifyContent="space-between"
                                    spacing={1}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            variant="body2"
                                            fontWeight={700}
                                            noWrap
                                            title={order.design}
                                        >
                                            {order.design || `Produkt #${order.product_id}`}
                                        </Typography>

                                        <Stack
                                            direction="row"
                                            spacing={0.75}
                                            alignItems="center"
                                            flexWrap="wrap"
                                            useFlexGap
                                            sx={{ mt: 0.35 }}
                                        >
                                            <Typography variant="caption" color="text.secondary">
                                                Produkt #{order.product_id}
                                            </Typography>
                                            {order.productType && (
                                                <Chip
                                                    label={order.productType}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ height: 19, fontSize: 10 }}
                                                />
                                            )}
                                        </Stack>
                                    </Box>

                                    {isSelected && (
                                        <CheckCircleIcon
                                            color="primary"
                                            fontSize="small"
                                            sx={{ flexShrink: 0 }}
                                        />
                                    )}
                                </Stack>

                                {/* Poziom 2: zamówienie */}

                                <Box sx={{
                                    mt: 1,
                                    px: 1.25,
                                    py: 0.85,
                                    borderRadius: 1.5,
                                    bgcolor: qtyColors.bg,
                                    border: '1px solid',
                                    borderColor: qtyColors.border,
                                }}>
                                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap alignItems="center">
                                        <Typography variant="caption" color="text.secondary">
                                            Nakład: <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                {formatQty(qtyOrdered)}
                                            </Box>
                                        </Typography>

                                        <Typography variant="caption" color="text.secondary">
                                            Wydano: <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                {formatQty(qtyIssued)}
                                            </Box>
                                        </Typography>

                                        <Typography variant="caption" color="text.secondary">
                                            Zwrócono: <Box component="span" sx={{ fontWeight: 700, color: 'info.main' }}>
                                                {formatQty(qtyReceived)}
                                            </Box>
                                        </Typography>

                                        <Typography variant="caption" color="text.secondary">
                                            Na produkcji: <Box component="span" sx={{ fontWeight: 700, color: qtyColors.text }}>
                                                {formatQty(qtyOnProduction)}
                                            </Box>
                                        </Typography>

                                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Do wydania:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 800, color: qtyColors.text }}>
                                                {formatQty(qtyToIssue)}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {isOverIssued && (
                                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'warning.dark', fontWeight: 600 }}>
                                            Wydano ponad nakład: {formatQty(qtyOnProduction - qtyOrdered)} szt.
                                        </Typography>
                                    )}
                                </Box>

                            </Box>
                        </Stack>
                    </ListItemButton>
                );
            })}

            {productOrders.length === 0 && (
                <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography variant="body2">
                        Brak zamówień dostępnych do wydania.
                    </Typography>
                </Box>
            )}
        </List>
    );
};

export default ProductOrderSelectList;
