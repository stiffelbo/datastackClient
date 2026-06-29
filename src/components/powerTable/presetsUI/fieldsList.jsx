import React, { useMemo, useState } from 'react';
import {
    Box,
    Stack,
    Typography,
    IconButton,
    Tooltip,
    Checkbox,
    TextField,
    Chip,
    Divider,
    InputAdornment,
    Popover
} from '@mui/material';

import {
    DragIndicator,
    ViewColumn,
    Visibility,
    VisibilityOff,
    Search,
} from '@mui/icons-material';

import InputTextHint from '../inputs/inputTextHint';
import ColumnType, { TYPES } from '../columnConfigurator/columnsType';

const FieldsList = ({ columns }) => {
    const cols = columns?.columns || [];

    const [dragIndex, setDragIndex] = useState(null);
    const [query, setQuery] = useState('');

    const [typeMenu, setTypeMenu] = useState({
        anchorEl: null,
        field: null,
    });

    const openTypeMenu = (event, field) => {
        event.stopPropagation();
        setTypeMenu({
            anchorEl: event.currentTarget,
            field,
        });
    };

    const closeTypeMenu = () => {
        setTypeMenu({
            anchorEl: null,
            field: null,
        });
    };

    const typeMenuColumn = cols.find(c => c.field === typeMenu.field);

    const filteredCols = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) {
            return cols.map((col, index) => ({ col, index }));
        }

        return cols
            .map((col, index) => ({ col, index }))
            .filter(({ col }) => {
                return [
                    col.field,
                    col.headerName,
                    col.fieldGroup,
                    col.type,
                    col.displayType,
                    col.input,
                ]
                    .filter(Boolean)
                    .some(value => String(value).toLowerCase().includes(q));
            });
    }, [cols, query]);

    const handleDragStart = (index) => {
        setDragIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (dropIndex) => {
        if (dragIndex !== null && dragIndex !== dropIndex) {
            columns?.reorderColumn?.(dragIndex, dropIndex);
        }

        setDragIndex(null);
    };

    const visibleCount = cols.filter(c => !c.hidden).length;

    const gridSettings = '36px minmax(80px, 0.5fr) minmax(110px, 1fr) minmax(140px, 1.2fr) minmax(110px, 1fr) minmax(110px, 1fr) minmax(70px, 0.8fr)';

    const getTypeLabel = (type) => {
        return TYPES.find(item => item.key === type)?.label || type || '-';
    };

    return (
        <Stack gap={1.5} sx={{ height: '100%', minHeight: 0 }}>
            <Box>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={1}
                    sx={{ mb: 1 }}
                >
                    <Stack direction="row" gap={0.75} alignItems="center">
                        <Chip
                            size="small"
                            variant="outlined"
                            label={`${visibleCount}/${cols.length} widoczne`}
                        />

                        <Tooltip title="Pokaż wszystkie kolumny">
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() => columns?.setAllVisible?.(true)}
                            >
                                <Visibility fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Ukryj wszystkie kolumny">
                            <IconButton
                                size="small"
                                color="warning"
                                onClick={() => columns?.setAllVisible?.(false)}
                            >
                                <VisibilityOff fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                <TextField
                    fullWidth
                    size="small"
                    value={query}
                    placeholder="Szukaj po field, header, group, type..."
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <Divider />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: gridSettings,
                    gap: 1,
                    px: 1,
                    py: 0.75,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    alignItems: 'center',
                }}
            >
                <Typography variant="caption" />
                <Typography variant="caption" fontWeight={700}>
                    Pokaż
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                    Pole
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                    Etykieta
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                    Typ Danych
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                    Szerokość
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                    Grupa
                </Typography>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: 'auto',
                    pr: 0.5,
                }}
            >
                <Stack gap={0.5}>
                    {filteredCols.map(({ col, index }) => {
                        const hidden = !!col.hidden;

                        return (
                            <Box
                                key={col.field}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: gridSettings,
                                    gap: 1,
                                    alignItems: 'center',
                                    px: 1,
                                    py: 0.75,
                                    border: 1,
                                    borderColor: hidden ? 'divider' : 'transparent',
                                    borderRadius: 1,
                                    bgcolor: hidden ? 'action.disabledBackground' : 'background.paper',
                                    opacity: hidden ? 0.65 : 1,
                                    cursor: 'grab',
                                    userSelect: 'none',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                }}
                            >
                                <Tooltip title="Przeciągnij, żeby zmienić kolejność">
                                    <IconButton size="small" sx={{ cursor: 'grab' }}>
                                        <DragIndicator fontSize="small" />
                                    </IconButton>
                                </Tooltip>

                                <Checkbox
                                    size="small"
                                    checked={!hidden}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        columns?.toggleColumnHidden?.(col.field);
                                    }}
                                />

                                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={600} noWrap>
                                        {col.field}
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary" noWrap>
                                        {col.source || '-'}
                                    </Typography>
                                </Stack>

                                <Box onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                                    <InputTextHint
                                        hints={[]}
                                        defaultValue={col.headerName || ''}
                                        onSubmit={(val) => columns?.setHeaderName?.(col.field, val)}
                                        placeholder="Nagłówek..."
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                fontSize: 13,
                                                py: 0.5,
                                            },
                                        }}
                                    />
                                </Box>

                                <Tooltip title="Kliknij, żeby zmienić typ danych">
                                    <Chip
                                        size="small"
                                        label={getTypeLabel(col.type)}
                                        variant="outlined"
                                        onClick={(e) => openTypeMenu(e, col.field)}
                                        disabled={col.type === 'action'}
                                        sx={{
                                            cursor: 'pointer',
                                            justifyContent: 'center',
                                            maxWidth: '100%',
                                            '& .MuiChip-label': {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            },
                                        }}
                                    />
                                </Tooltip>

                                <Box onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                                    <InputTextHint
                                        hints={[]}
                                        defaultValue={String(col.width ?? '')}
                                        onSubmit={(val) => {
                                            const n = Number(val);
                                            if (Number.isFinite(n)) {
                                                columns?.setColumnWidth?.(col.field, n);
                                            }
                                        }}
                                        placeholder="Width..."
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                fontSize: 13,
                                                py: 0.5,
                                                textAlign: 'center'
                                            },
                                        }}
                                    />
                                </Box>

                                <Box onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                                    <InputTextHint
                                        hints={columns?.getAllGroups?.() || []}
                                        defaultValue={col.fieldGroup || ''}
                                        onSubmit={(val) => columns?.setGroupName?.(col.field, val)}
                                        placeholder="Grupa..."
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                fontSize: 13,
                                                py: 0.5,
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>
                        );
                    })}
                    <Popover
                        open={!!typeMenu.anchorEl}
                        anchorEl={typeMenu.anchorEl}
                        onClose={closeTypeMenu}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        {typeMenuColumn && (
                            <ColumnType
                                field={typeMenuColumn.field}
                                column={typeMenuColumn}
                                columnsSchema={columns}
                                onClose={closeTypeMenu}
                            />
                        )}
                    </Popover>
                </Stack>
            </Box>

            {!filteredCols.length && (
                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                    Brak pól pasujących do wyszukiwania.
                </Typography>
            )}
        </Stack>
    );
};

export default FieldsList;