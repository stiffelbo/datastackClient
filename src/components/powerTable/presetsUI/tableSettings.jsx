import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Divider,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';

import { normalizeViewConfig } from '../hooks/presetUtils';

/**
 * Ustawienia zgodne z viewConfigUtils:
 *
 * viewConfig.table:
 * - rowHeight
 * - fontSize
 * - backgroundColor
 * - textColor
 * - px
 * - py
 *
 * viewConfig.tree:
 * - enabled
 * - canDisable
 * - parentField
 * - idField
 * - rootValue
 */
const parsePx = (value, fallback = 0) => {
    if (typeof value === 'number') return value;

    const n = Number(String(value ?? '').replace('px', '').trim());
    return Number.isFinite(n) ? n : fallback;
};

const toPx = (value, fallback = 0) => {
    const n = Number(value);
    return `${Number.isFinite(n) ? n : fallback}px`;
};

const toFormState = (viewConfig) => ({
    ...viewConfig,
    table: {
        ...viewConfig.table,
        fontSize: parsePx(viewConfig.table?.fontSize, 13),
        px: parsePx(viewConfig.table?.px, 6),
        py: parsePx(viewConfig.table?.py, 6),
    },
});

const toViewConfig = (form) => ({
    ...form,
    table: {
        ...form.table,
        fontSize: toPx(form.table.fontSize, 13),
        px: toPx(form.table.px, 6),
        py: toPx(form.table.py, 6),
    },
});

const ColorField = ({
    label,
    value,
    fallback = '#ffffff',
    onChange,
    onReset,
}) => {
    const pickerValue =
        typeof value === 'string' && value.startsWith('#')
            ? value
            : fallback;

    return (
        <Stack direction="row" gap={1} alignItems="center">
            <TextField
                fullWidth
                size="small"
                label={label}
                value={value ?? 'inherit'}
                onChange={(e) => onChange(e.target.value)}
            />

            <TextField
                size="small"
                type="color"
                value={pickerValue}
                onChange={(e) => onChange(e.target.value)}
                sx={{
                    width: 64,
                    '& input': {
                        p: 0.5,
                        height: 32,
                        cursor: 'pointer',
                    },
                }}
            />

            <Button
                size="small"
                variant="outlined"
                onClick={onReset}
            >
                inherit
            </Button>
        </Stack>
    );
};

const TableSettings = ({ presets, columns }) => {
    const fields = useMemo(() => {
        return (columns?.columns || [])
            .filter(col => !!col?.field)
            .map(col => ({
                field: col.field,
                headerName: col.headerName || col.field,
                type: col.type || '',
                fieldGroup: col.fieldGroup || '',
            }));
    }, [columns]);

    const current = useMemo(
        () => normalizeViewConfig(presets?.viewConfig || {}),
        [presets?.viewConfig]
    );

    const [form, setForm] = useState(() => toFormState(current));

    useEffect(() => {
        setForm(toFormState(current));
    }, [current]);

    const updateTable = (key, value) => {
        setForm(prev => ({
            ...prev,
            table: {
                ...prev.table,
                [key]: value,
            },
        }));
    };

    const updateTree = (key, value) => {
        setForm(prev => ({
            ...prev,
            tree: {
                ...prev.tree,
                [key]: value,
            },
        }));
    };

    const handleSubmit = () => {
        presets?.setViewConfig?.(
            normalizeViewConfig(toViewConfig(form))
        );
    };

    const handleReset = () => {
        setForm(toFormState(current));
    };

    const handleDefault = () => {
        presets?.setDefaultViewConfig?.();
    };

    return (
        <Stack gap={2}>
            <Alert severity="info">
                Ustawienia działają globalnie dla tabeli,
                niezależnie od aktywnego presetu kolumn.
            </Alert>

            <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
                <Box sx={{ flex: 1, minWidth: 0 }}>

                    <Stack gap={1.5}>
                        <TextField
                            label="Wysokość wiersza px"
                            size="small"
                            type="number"
                            value={form.table.rowHeight}
                            onChange={(e) => updateTable('rowHeight', e.target.value)}
                            inputProps={{ min: 18, max: 120, step: 1 }}
                        />

                        <TextField
                            label="Wielkość czcionki px"
                            size="small"
                            type="number"
                            value={form.table.fontSize}
                            onChange={(e) => updateTable('fontSize', e.target.value)}
                            inputProps={{ min: 8, max: 32, step: 1 }}
                        />

                        <Stack direction="row" gap={1}>
                            <TextField
                                fullWidth
                                label="Padding X px"
                                size="small"
                                type="number"
                                value={form.table.px}
                                onChange={(e) => updateTable('px', e.target.value)}
                                inputProps={{ min: 0, max: 48, step: 1 }}
                            />

                            <TextField
                                fullWidth
                                label="Padding Y px"
                                size="small"
                                type="number"
                                value={form.table.py}
                                onChange={(e) => updateTable('py', e.target.value)}
                                inputProps={{ min: 0, max: 48, step: 1 }}
                            />
                        </Stack>

                        <Divider />
                        <FormControl size="small" fullWidth>
                            <InputLabel id="page-size-label">
                                Rozmiar strony
                            </InputLabel>

                            <Select
                                labelId="page-size-label"
                                label="Rozmiar strony"
                                value={form.table.pageSize}
                                onChange={(e) => updateTable('pageSize', e.target.value)}
                                disabled
                            >
                                {[100, 200, 500, 1000].map(size => (
                                    <MenuItem key={size} value={size}>
                                        {size} wierszy
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>
                <Divider flexItem orientation="vertical" />

                <Box sx={{ flex: 1, minWidth: 0 }}>

                    <Stack gap={1.5}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={!!form.tree.enabled}
                                    disabled={!form.tree.canDisable}
                                    onChange={(e) => updateTree('enabled', e.target.checked)}
                                />
                            }
                            label="Włącz tryb drzewa"
                        />

                        <FormControl size="small" fullWidth>
                            <InputLabel id="tree-id-field-label">
                                Pole ID
                            </InputLabel>

                            <Select
                                labelId="tree-id-field-label"
                                label="Pole ID"
                                value={form.tree.idField || ''}
                                onChange={(e) => updateTree('idField', e.target.value)}
                            >
                                {fields.map((field) => (
                                    <MenuItem key={field.field} value={field.field}>
                                        {field.field} — {field.headerName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" fullWidth>
                            <InputLabel id="tree-parent-field-label">
                                Pole Rodzica
                            </InputLabel>

                            <Select
                                labelId="tree-parent-field-label"
                                label="Pole parent"
                                value={form.tree.parentField || ''}
                                onChange={(e) => updateTree('parentField', e.target.value)}
                            >
                                {fields.map((field) => (
                                    <MenuItem key={field.field} value={field.field}>
                                        {field.field} — {field.headerName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="flex-end" gap={1}>
                <Button variant="outlined" onClick={handleReset}>
                    Odrzuć zmiany formularza
                </Button>

                <Button color="warning" variant="outlined" onClick={handleDefault}>
                    Przywróć domyślne
                </Button>

                <Button variant="contained" onClick={handleSubmit}>
                    Zapisz ustawienia
                </Button>
            </Stack>
        </Stack>
    );
};

export default TableSettings;