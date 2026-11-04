
import React from 'react';

import useEntity from '../../hooks/useEntity';
import { useForm } from '../../components/powerTable/form/useForm';
import { createRenderInput } from '../../components/common/RenderInput';
import FormActionsBar from '../../components/common/FormActionsBar';

import { Box, Stack, TextField, Typography } from '@mui/material';

import ProductOrderSelectList from '../productOrder/ProductOrderSelectList';

const WhStockEntriesShift = ({ id, row, entity, rwd, dashboard }) => {
    const shiftEntity = useEntity({
        endpoint: 'wh_shifts',
        entityName: 'WhStockEntryShifts',
        schemaQuery: { source_stock_entry_id: id },
        query: { source_stock_entry_id: id },
    });

    const onSubmit = async () => {
        const data = form.formState;

        const ordered = Number(selectedOrder?.qty_ordered ?? 0);
        const issued = Number(selectedOrder?.qty_issued ?? 0) - Number(selectedOrder?.qty_received ?? 0);
        const qty = Number(data.qty ?? 0);
        const total = issued + qty;

        if (selectedOrder && total > ordered) {
            const confirmed = window.confirm(
                `Uwaga! Przekroczysz nakład zamówienia.\n\n` +
                `Nakład: ${ordered} szt.\n` +
                `Już wydano: ${issued} szt.\n` +
                `Nowe wydanie: ${qty} szt.\n` +
                `Łącznie po wydaniu: ${total} szt.\n` +
                `Przekroczenie: ${total - ordered} szt.\n\n` +
                `Czy mimo to utworzyć wydanie?`
            );

            if (!confirmed) return;
        }

        await shiftEntity.create(data);
        await shiftEntity.refresh();
        await entity.refresh();
    };

    const form = useForm({ schema: shiftEntity?.schema?.addForm?.schema, onSubmit: shiftEntity.create });
    const renderInput = createRenderInput(form, {});

    const schema = shiftEntity?.schema ?? {};
    const productOrdersList = Array.isArray(schema.relatedItems) ? schema.relatedItems : [];

    const selected = form.getFieldState('product_order_id')?.value;
    const selectedOrder = productOrdersList.find(order => String(order.id) === String(selected));

    // Stan zasobu: najpierw kontekst WP, potem dane aktualnego wiersza.
    const availableQty = Math.max(
        0,
        Number(schema.wp?.max_qty ?? schema.stock?.qty_available ?? row?.qty_available ?? 0)
    );

    // Pozostała ilość zamówienia.
    const orderQty = selectedOrder
        ? Math.max(
            0,
            Number(selectedOrder.qty_to_do ?? selectedOrder.qty_ordered ?? 0)
        )
        : null;

    const orderQtyToIssue = +selectedOrder?.qty_ordered ? orderQty - +selectedOrder.qty_issued : 0;

    const maxQty = orderQty === null
        ? availableQty
        : Math.min(availableQty, orderQty);

    const qtyState = form.getFieldState('qty');
    const qty = qtyState?.value ?? '';
    const qtyNumber = Number(qty);

    const qtyError = qty !== '' && (
        !Number.isFinite(qtyNumber) ||
        qtyNumber <= 0 ||
        qtyNumber > maxQty
    );

    const qtyHelper = qtyError
        ? qtyNumber <= 0
            ? 'Ilość musi być większa od zera.'
            : `Maksymalna ilość do wydania: ${maxQty}.`
        : selectedOrder
            ? `Dostępne w magazynie: ${availableQty} · Pozostało do wydania: ${orderQtyToIssue}`
            : `Dostępne w magazynie: ${availableQty}`;

    const canSubmit =
        form.isChanged &&
        !qtyError &&
        qty !== '' &&
        maxQty > 0 &&
        !!selectedOrder &&
        !shiftEntity.loading;

    return (
        <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                mb: 2,
                borderRadius: 2,
                bgcolor: 'success.main',
                backgroundColor: 'rgba(46, 125, 50, 0.06)',
                border: '1px solid',
                borderColor: 'rgba(46, 125, 50, 0.18)',
            }}>
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Dostępne do wydania
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Aktualna ilość dostępna w tej partii magazynowej
                    </Typography>
                </Box>

                <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 2 }}>
                    <Typography sx={{ fontSize: 24, fontWeight: 700, color: 'success.dark', lineHeight: 1.2 }}>
                        {Number(row?.qty_available ?? 0).toLocaleString('pl-PL', { maximumFractionDigits: 4 })}
                        <Typography component="span" sx={{ fontSize: 12, fontWeight: 500, ml: 0.75 }}>
                            {row?.unit ?? 'szt.'}
                        </Typography>
                    </Typography>
                </Box>
            </Box>
            <Stack spacing={2}>
                <ProductOrderSelectList
                    productOrders={productOrdersList}
                    onSelect={order => form.setField('product_order_id', order.id)}
                    selected={selected}
                />

                {selected && <Box>
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
                        helperText={qtyHelper}
                        disabled={maxQty <= 0}
                        slotProps={{
                            htmlInput: {
                                min: 1,
                                max: maxQty,
                                step: 1,
                            },
                        }}
                    />
                </Box>}

                {renderInput('notes')}

                <FormActionsBar
                    onSubmit={() => onSubmit()}
                    onCancel={() => dashboard.setCurrentId(null)}
                    disabled={!canSubmit}
                    loading={shiftEntity.loading}
                />
            </Stack>
        </Box>
    );
};

export default WhStockEntriesShift;
