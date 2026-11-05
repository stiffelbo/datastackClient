
import React from 'react';

import {
    Alert,
    Box,
    Stack,
    Typography,
    Paper,
    Chip,
} from '@mui/material';

import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const formatQty = value =>
    Number(value ?? 0).toLocaleString('pl-PL', { maximumFractionDigits: 4 });

const formatDate = value =>
    value ? value.slice(0, 10).split('-').reverse().join('.') : '—';

const WhShiftsSelectList = ({ shifts = [], selected = null, onSelect }) => {
    const selectedId = typeof selected === 'object' ? selected?.id : selected;

    if (!Array.isArray(shifts)) {
        return <Alert severity="error">Niepoprawna struktura danych wydań.</Alert>;
    }

    if (shifts.length === 0) {
        return <Alert severity="info">Brak wydań produkcyjnych do rozliczenia.</Alert>;
    }

    return (
        <Stack spacing={0.75}>
            {shifts.map(shift => {
                const isSelected = selectedId != null && String(selectedId) === String(shift.id);
                const remaining = Math.max(0, Number(shift.qty_remaining ?? shift.qty ?? 0));
                const disabled = remaining <= 0;

                return (
                    <Paper
                        key={shift.id}
                        variant="outlined"
                        onClick={() => {
                            if (!disabled) onSelect?.(shift);
                        }}
                        sx={{
                            p: 1.25,
                            borderRadius: 1.5,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.5 : 1,
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            bgcolor: isSelected ? 'action.selected' : 'background.paper',
                            '&:hover': disabled ? {} : { borderColor: 'primary.light' },
                        }}
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Inventory2OutlinedIcon
                                color={isSelected ? 'primary' : 'action'}
                                fontSize="small"
                            />

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    flexWrap="wrap"
                                    useFlexGap
                                >
                                    <Typography variant="body2" fontWeight={700}>
                                        Wydanie WP #{shift.id}
                                    </Typography>

                                    <Chip
                                        label={`PZ #${shift.source_stock_entry_id}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: 10 }}
                                    />

                                    {Number(shift.is_done) === 1 && (
                                        <Chip
                                            label="Potwierdzone"
                                            color="success"
                                            size="small"
                                            variant="outlined"
                                            sx={{ height: 20, fontSize: 10 }}
                                        />
                                    )}
                                </Stack>

                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    flexWrap="wrap"
                                    useFlexGap
                                    sx={{ mt: 0.5 }}
                                >
                                    <Typography variant="caption" color="text.secondary">
                                        Wydano: {formatQty(shift.qty)}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color={disabled ? 'text.disabled' : 'success.main'}
                                        fontWeight={700}
                                    >
                                        Pozostało: {formatQty(remaining)}
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary">
                                        {formatDate(shift.planned_at)}
                                    </Typography>
                                </Stack>

                                {shift.notes && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                        sx={{ mt: 0.5 }}
                                    >
                                        {shift.notes}
                                    </Typography>
                                )}
                            </Box>

                            {isSelected && (
                                <CheckCircleIcon color="primary" fontSize="small" />
                            )}
                        </Stack>
                    </Paper>
                );
            })}
        </Stack>
    );
};

export default WhShiftsSelectList;
