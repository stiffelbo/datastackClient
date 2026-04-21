import React, { useMemo, useState } from 'react';
import {
    Alert,
    Autocomplete,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

const toDateInputValue = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const toSqlDateTime = (date) => (date ? `${date} 00:00:00` : null);

const getEmployeeOptionLabel = (option) => {
    if (!option) return '';
    return option.label || option.name || '';
};

export default function ShiftToUserForm({ shifts }) {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [dateFrom, setDateFrom] = useState(toDateInputValue());
    const [comment, setComment] = useState('');

    const isBlocked = !shifts?.canCreateShift;
    const employees = Array.isArray(shifts?.employees) ? shifts.employees : [];

    const isValid = Boolean(
        shifts?.assetId &&
        selectedEmployee &&
        dateFrom &&
        !isBlocked
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) return;

        await shifts.createShift({
            id_it_asset: shifts.assetId,
            id_employee: selectedEmployee?.value ?? selectedEmployee?.id ?? null,
            date_from: toSqlDateTime(dateFrom),
            date_to: null,
            comment: comment || '',
            is_active: true,
        });

        setSelectedEmployee(null);
        setDateFrom(toDateInputValue());
        setComment('');
    };

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
                <Stack spacing={0.5}>
                    <Typography variant="h6">Nowe wydanie</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {shifts?.assetLabel || `Asset #${shifts?.assetId ?? '—'}`}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                        size="small"
                        color={shifts?.isAssetShifted ? 'warning' : 'success'}
                        label={shifts?.isAssetShifted ? 'Aktualnie wydany' : 'Dostępny'}
                    />
                </Stack>

                {isBlocked && (
                    <Alert severity="warning">
                        Nie można dodać nowego wydania. Asset jest już wydany albo nieaktywny.
                    </Alert>
                )}

                {!isBlocked && (
                    <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <Autocomplete
                            options={employees}
                            value={selectedEmployee}
                            onChange={(_, value) => setSelectedEmployee(value || null)}
                            getOptionLabel={getEmployeeOptionLabel}
                            groupBy={(option) => option?.groupLabel || 'Bez działu'}
                            getOptionDisabled={(option) => Boolean(option?.disabled)}
                            isOptionEqualToValue={(option, value) =>
                                (option?.value ?? option?.id) === (value?.value ?? value?.id)
                            }
                            disabled={shifts?.loading || shifts?.saving || isBlocked}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Pracownik"
                                    required
                                    fullWidth
                                />
                            )}
                        />

                        <TextField
                            label="Data wydania"
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            disabled={shifts?.loading || shifts?.saving || isBlocked}
                            required
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            label="Komentarz"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={shifts?.loading || shifts?.saving || isBlocked}
                            multiline
                            minRows={3}
                            fullWidth
                        />

                        <Stack direction="row" justifyContent="flex-end">
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!isValid || shifts?.saving}
                                startIcon={shifts?.saving ? <CircularProgress size={16} /> : null}
                            >
                                {shifts?.saving ? 'Zapisywanie...' : 'Wydaj asset'}
                            </Button>
                        </Stack>
                    </Stack>
                </form>
                )}                
            </Stack>
        </Paper>
    );
}