
import React from 'react';

import useEntity from '../../hooks/useEntity';
import { useForm } from '../../components/powerTable/form/useForm';
import { createRenderInput } from '../../components/common/RenderInput';
import FormActionsBar from '../../components/common/FormActionsBar';

import {
    Alert,
    Box,
    Stack,
    TextField,
    Typography,
    Paper,
    Avatar,
    Chip,
} from '@mui/material';

import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const formatQty = value =>
    Number(value ?? 0).toLocaleString('pl-PL', { maximumFractionDigits: 4 });

const ProductOrderShift = ({ id, row, entity, rwd, dashboard }) => {
    const shiftEntity = useEntity({
        endpoint: 'wh_shifts',
        entityName: 'ProductOrderShifts',
        schemaQuery: { product_order_id: id },
        query: { product_order_id: id },
    });

    const form = useForm({
        schema: shiftEntity?.schema?.addForm?.schema,
    });

    const wpContext = shiftEntity?.schema?.wp ?? {};
    const reasons = wpContext?.reasons ?? [];

    const renderInput = createRenderInput(form, {});

    const schema = shiftEntity?.schema ?? {};
    const stockEntries = Array.isArray(schema.relatedItems) ? schema.relatedItems : [];
    const order = schema.order ?? row ?? {};

    const selected = form.getFieldState('source_stock_entry_id')?.value;
    const selectedStock = stockEntries.find(stock => String(stock.id) === String(selected));

    const availableQty = Math.max(0, Number(selectedStock?.qty_available ?? 0));

    const ordered = Number(order.qty_ordered ?? 0);
    const issued = Number(order.qty_issued ?? 0) - Number(order.qty_received ?? 0);
    const remaining = Math.max(0, ordered - issued);

    const qty = form.getFieldState('qty')?.value ?? '';
    const qtyNumber = Number(qty);

    const qtyError = qty !== '' && (
        !Number.isFinite(qtyNumber) ||
        qtyNumber <= 0 ||
        qtyNumber > availableQty
    );

    const canSubmit =
        form.isChanged &&
        !!selectedStock &&
        qty !== '' &&
        !qtyError &&
        availableQty > 0 &&
        !shiftEntity.loading;

    const onSubmit = async () => {
        const data = {
            ...form.formState,
            product_order_id: id,
            source_stock_entry_id: selectedStock.id,
            operation_type: 'WP',
            balance_side: -1,
        };

        const total = issued + Number(data.qty);

        if (total > ordered) {
            const confirmed = window.confirm(
                `Uwaga! Przekroczysz nakład zamówienia.\n\n` +
                `Nakład: ${formatQty(ordered)} szt.\n` +
                `Już wydano netto: ${formatQty(issued)} szt.\n` +
                `Nowe wydanie: ${formatQty(data.qty)} szt.\n` +
                `Łącznie: ${formatQty(total)} szt.\n` +
                `Przekroczenie: ${formatQty(total - ordered)} szt.\n\n` +
                `Czy mimo to utworzyć wydanie?`
            );

            if (!confirmed) return;
        }

        await shiftEntity.create(data);
        await shiftEntity.refresh();
        await entity.refresh();
    };

    const renderReasons = () => {
        if (reasons.length === 0) return null;

        return reasons.map(reason => (
            <p>{reason}</p>
        ));
    };

    return (
        <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <Stack spacing={2}>

                {/* Podsumowanie zamówienia */}
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                        Wydanie na zamówienie {order.label ?? `#${id}`}
                    </Typography>

                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        <Typography variant="caption">
                            Nakład: <b>{formatQty(ordered)}</b>
                        </Typography>
                        <Typography variant="caption">
                            Wydano netto: <b>{formatQty(issued)}</b>
                        </Typography>
                        <Typography variant="caption" color={remaining === 0 ? 'success.main' : 'text.secondary'}>
                            Do wydania: <b>{formatQty(remaining)}</b>
                        </Typography>
                    </Stack>
                </Paper>

                {renderReasons()}

                {/* Wybór partii magazynowej */}
                <Box>
                    {stockEntries.length ? (<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                        Wybierz partię magazynową
                    </Typography>) : null}
                    <Stack spacing={0.75}>
                        {stockEntries.map(stock => {
                            const isSelected = String(selected) === String(stock.id);
                            const stockQty = Number(stock.qty_available ?? 0);
                            const disabled = stockQty <= 0;

                            return (
                                <Paper
                                    key={stock.id}
                                    variant="outlined"
                                    onClick={() => {
                                        if (!disabled) form.setField('source_stock_entry_id', stock.id);
                                    }}
                                    sx={{
                                        p: 1,
                                        borderRadius: 1.5,
                                        cursor: disabled ? 'not-allowed' : 'pointer',
                                        opacity: disabled ? 0.5 : 1,
                                        borderColor: isSelected ? 'primary.main' : 'divider',
                                        bgcolor: isSelected ? 'action.selected' : 'background.paper',
                                        '&:hover': disabled ? {} : { borderColor: 'primary.light' },
                                    }}
                                >
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar
                                            src={stock.img_url || undefined}
                                            variant="rounded"
                                            sx={{ width: 48, height: 48, bgcolor: 'action.hover' }}
                                        >
                                            <Inventory2OutlinedIcon />
                                        </Avatar>

                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" fontWeight={700} noWrap>
                                                {stock.label || `Partia #${stock.id}`}
                                            </Typography>

                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                                                <Chip label={`PZ #${stock.id}`} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Stan: {formatQty(stock.qty_total)}
                                                </Typography>
                                                <Typography variant="caption" color="success.main" fontWeight={700}>
                                                    Dostępne: {formatQty(stockQty)} {stock.unit ?? 'szt.'}
                                                </Typography>
                                            </Stack>
                                        </Box>

                                        {isSelected && <CheckCircleIcon color="primary" fontSize="small" />}
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Stack>
                </Box>

                {/* Ilość */}
                {selectedStock && (
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
                            Ilość do wydania
                        </Typography>

                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={qty}
                            onChange={event => form.setField('qty', event.target.value)}
                            error={qtyError}
                            helperText={
                                qtyError
                                    ? `Dozwolona ilość: 1–${formatQty(availableQty)}`
                                    : `Dostępne w wybranej partii: ${formatQty(availableQty)} · Pozostało w zamówieniu: ${formatQty(remaining)}`
                            }
                            slotProps={{
                                htmlInput: {
                                    min: 1,
                                    max: availableQty,
                                    step: 1,
                                },
                            }}
                        />
                    </Box>
                )}

                {renderInput('notes')}

                <FormActionsBar
                    onSubmit={onSubmit}
                    onCancel={() => dashboard.setCurrentId(null)}
                    disabled={!canSubmit}
                    loading={shiftEntity.loading}
                />
            </Stack>
        </Box>
    );
};

export default ProductOrderShift;
