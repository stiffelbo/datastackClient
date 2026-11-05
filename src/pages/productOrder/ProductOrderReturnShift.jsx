
import React, { useState } from 'react';

import useEntity from '../../hooks/useEntity';
import { useForm } from '../../components/powerTable/form/useForm';
import { createRenderInput } from '../../components/common/RenderInput';
import FormActionsBar from '../../components/common/FormActionsBar';
import WhShiftsSelectList from '../whShifts/WhShiftsSelectList';

import {
    Alert,
    Box,
    Stack,
    TextField,
    Typography,
    Paper,
    Chip,
    Button,
    ButtonGroup,
    FormControlLabel,
    Divider,
} from '@mui/material';

import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

const formatQty = value =>
    Number(value ?? 0).toLocaleString('pl-PL', { maximumFractionDigits: 4 });

const formatDate = value =>
    value ? new Date(value.replace(' ', 'T')).toLocaleDateString('pl-PL') : '—';

const ProductOrderReturnShift = ({ id, row, entity, rwd, dashboard }) => {
    const [mode, setMode] = useState('return');

    const shiftEntity = useEntity({
        endpoint: 'wh_shifts',
        entityName: 'ProductOrderReturnShift',
        schemaQuery: { return_product_order_id: id },
        query: { product_order_id: id },
    });

    const form = useForm({
        schema: shiftEntity?.schema?.addForm?.schema,
    });

    const renderInput = createRenderInput(form, {});

    const schema = shiftEntity?.schema ?? {};
    const shifts = Array.isArray(schema.relatedItems?.shifts)
        ? schema.relatedItems.shifts
        : [];

    const selectedId = form.getFieldState('source_shift_id')?.value;
    const selectedShift = shifts.find(shift => String(shift.id) === String(selectedId));

    const qty = form.getFieldState('qty')?.value ?? '';
    const qtyNumber = Number(qty);

    const availableQty = Math.max(
        0,
        Number(selectedShift?.qty_remaining ?? selectedShift?.qty ?? 0)
    );

    const qtyError = qty !== '' && (
        !Number.isFinite(qtyNumber) ||
        qtyNumber <= 0 ||
        qtyNumber > availableQty
    );

    const locationId = form.getFieldState('to_location_id')?.value;

    const canSubmit =
        !!selectedShift &&
        qty !== '' &&
        !qtyError &&
        availableQty > 0 &&
        !shiftEntity.loading;

    const selectShift = shift => {
        form.setField('source_shift_id', shift.id);
        form.setField('source_stock_entry_id', shift.source_stock_entry_id);
        form.setField('m_idx_id', shift.m_idx_id);
        form.setField('from_location_id', shift.to_location_id);
        form.setField('qty', shift.qty_remaining ?? shift.qty);
    };

    const onSubmit = async () => {
        if (!canSubmit) return;

        if (mode === 'production' && !row?.product_id) {
            window.alert('Brak identyfikatora produktu dla tego zamówienia.');
            return;
        }

        const data = {
            ...form.formState,
            product_order_id: id,
            source_shift_id: selectedShift.id,
            source_stock_entry_id: selectedShift.source_stock_entry_id,
            m_idx_id: selectedShift.m_idx_id,
            from_location_id: selectedShift.to_location_id,
            to_location_id: locationId,
            operation_type: 'ZP',
            balance_side: 1,
            qty: qtyNumber,
            reference_no: mode === 'production'
                ? String(row.product_id)
                : null,
        };

        await shiftEntity.create(data);
        await shiftEntity.refresh();
        await entity?.refresh?.();
    };

    if (!shifts.length) {
        return (
            <Alert severity="info">
                Brak wydań produkcyjnych do rozliczenia.
            </Alert>
        );
    }

    return (
        <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <Stack spacing={2}>

                <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                        Rozliczenie wydania na produkcję
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Wybierz wydanie WP, które chcesz rozliczyć.
                    </Typography>
                </Box>

                <WhShiftsSelectList
                    shifts={shifts}
                    selected={selectedId}
                    onSelect={selectShift}
                />

                {selectedShift && (
                    <>
                        <Divider />

                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>
                                Ilość do rozliczenia
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
                                        : `Pozostało z WP #${selectedShift.id}: ${formatQty(availableQty)} szt.`
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

                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>
                                Rodzaj rozliczenia
                            </Typography>

                            <ButtonGroup size="small" sx={{ '& .MuiButton-root': { px: 2, py: 0.75, textTransform: 'none', fontWeight: 600 } }}>
                                <Button
                                    variant={mode === 'return' ? 'contained' : 'outlined'}
                                    color={mode === 'return' ? 'primary' : 'inherit'}
                                    startIcon={<KeyboardReturnIcon />}
                                    onClick={() => setMode('return')}
                                >
                                    Zwrot na magazyn
                                </Button>
                                <Button
                                    variant={mode === 'production' ? 'contained' : 'outlined'}
                                    color={mode === 'production' ? 'success' : 'inherit'}
                                    startIcon={<TaskAltIcon />}
                                    onClick={() => setMode('production')}
                                >
                                    Zakończenie produkcji
                                </Button>
                            </ButtonGroup>
                        </Box>

                        {mode === 'production' && (
                            <Alert severity="info" sx={{ py: 0.5 }}>
                                Rozliczenie produkcji dla produktu #{row?.product_id ?? '—'}.
                                Identyfikator produktu zostanie zapisany w reference_no.
                            </Alert>
                        )}

                        {renderInput('to_location_id')}
                        {renderInput('notes')}
                    </>
                )}

                <FormActionsBar
                    onSubmit={onSubmit}
                    onCancel={() => dashboard?.setCurrentId?.(null)}
                    disabled={!canSubmit}
                    loading={shiftEntity.loading}
                />
            </Stack>
        </Box>
    );
};

export default ProductOrderReturnShift;
