// RelationMapperPT.jsx
import React, {
    useMemo,
    useState,
    useCallback,
    useRef,
    useEffect,
} from 'react';
import {
    Box,
    Stack,
    Typography,
    TextField,
    IconButton,
    InputAdornment,
    Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import PowerTable from '../powerTable/powerTable';

const normalize = (str) =>
    (str ?? '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

const buildSlug = (row, fields = []) => {
    const parts = [];
    fields.forEach((f) => {
        if (row && row[f] != null) parts.push(String(row[f]));
    });
    parts.push(JSON.stringify(row ?? {}));
    return normalize(parts.join(' | '));
};

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const Mapper = ({
    entityName = 'defaultMapper',
    ownerLabel,
    owner,
    
    leftData = [],
    leftColumns = [],
    leftSearchFields = [],
    
    rightData = [],
    rightColumnsBase = [],
    rightSearchFields = [],
    
    distinct = false,
    idField = 'id',
    distinctField = 'id',
    orderField = null, // na razie tylko info tekstowe – logika po Twojej stronie

    onAdd,        // ({ mappedItemData, prevElementData }) => ...
    onEditLeft,   // (newValue, params) => ...
    onDeleteLeft, // (row) => ...

    height = 500,
    leftRowHeight = 40,
    rightRowHeight = 40,
}) => {
    const [search, setSearch] = useState('');

    // 🔹 selekcja lewej – używamy wbudowanego selecta PT,
    // ale przechowujemy lokalnie
    const [leftSelected, setLeftSelected] = useState([]); // np. [id1, id2]

    // 🔹 kontrola widoczności paneli
    const [showLeft, setShowLeft] = useState(true);
    const [showRight, setShowRight] = useState(true);

    // 🔹 kontrola szerokości jak w DashboardLayout
    const containerRef = useRef(null);
    const [leftRatio, setLeftRatio] = useState(0.5);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleMouseMove = useCallback(
        (e) => {
            if (!isDragging || !containerRef.current || !showLeft || !showRight) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const ratio = x / rect.width;
            setLeftRatio((prev) => clamp(ratio, 0.2, 0.8));
        },
        [isDragging, showLeft, showRight]
    );

    const handleMouseUp = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);
    }, [isDragging]);

    useEffect(() => {
        if (!isDragging) return;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const needle = normalize(search.trim());

    const matchesSearch = useCallback(
        (row, fields) => {
            if (!needle) return true;
            return buildSlug(row, fields).includes(needle);
        },
        [needle]
    );

    const usedIds = useMemo(() => {
        if (!distinct) return null;

        const ids = leftData
            .map((row) => row?.[distinctField])
            .filter((v) => v !== null && v !== undefined);

        return new Set(ids);
    }, [leftData, distinct, distinctField]);

    const filteredLeftData = useMemo(
        () => leftData.filter((row) => matchesSearch(row, leftSearchFields)),
        [leftData, leftSearchFields, matchesSearch]
    );

    const filteredRightData = useMemo(
        () =>
            rightData.filter((row) => {
                // najpierw globalne szukanie
                if (!matchesSearch(row, rightSearchFields)) return false;

                // distinct: chowamy pozycje, które już są przypisane
                if (distinct && usedIds && usedIds.has(row[idField])) {
                    return false;
                }

                return true;
            }),
        [rightData, rightSearchFields, matchesSearch, distinct, usedIds, idField]
    );

    // 🔑 aktualny "prevElement" – np. pierwszy zaznaczony w filtrach
    const prevElementData = useMemo(() => {
        if (!leftSelected || (Array.isArray(leftSelected) && leftSelected.length === 0)) {
            return null;
        }
        const ids = Array.isArray(leftSelected) ? leftSelected : [leftSelected];
        const set = new Set(ids);
        return filteredLeftData.find((r) => set.has(r[idField])) || null;
    }, [filteredLeftData, leftSelected, idField]);

    // 🔑 selekcja po prawej → od razu callback onAdd, bez trzymania stanu
    const handleSelectRight = useCallback(
        (selectedIdsOrId) => {
            if (!onAdd) return;

            const ids = Array.isArray(selectedIdsOrId)
                ? selectedIdsOrId
                : [selectedIdsOrId];

            if (!ids.length) return;

            const lastId = ids[ids.length - 1];
            const mappedItemData = rightData.find((r) => r[idField] === lastId);
            if (!mappedItemData) return;

            onAdd({
                mappedItemData,
                prevElementData,
            });

            // nie zapisujemy selekcji po prawej → PT dostaje selected={[]}
        },
        [onAdd, rightData, idField, prevElementData]
    );

    const handleEditLeft = useCallback(
        (params) => {
            if (!onEditLeft) return;
            return onEditLeft(params);
        },
        [onEditLeft]
    );

    const handleDeleteLeft = useCallback(
        (id) => {
            if (!onDeleteLeft) return;
            const row = filteredLeftData.find((r) => r[idField] === id);
            if (row) onDeleteLeft(row);
        },
        [filteredLeftData, onDeleteLeft, idField]
    );

    // 🔹 layout ratios
    const effectiveLeftRatio =
        showLeft && showRight ? leftRatio : showLeft && !showRight ? 1 : 0;
    const showResizer = showLeft && showRight;

    const toggleLeft = () => {
        // nie pozwalamy wyłączyć obu naraz
        setShowLeft((prev) => {
            if (!prev && !showRight) return true;
            return !prev;
        });
    };

    const toggleRight = () => {
        setShowRight((prev) => {
            if (!prev && !showLeft) return true;
            return !prev;
        });
    };

    return (
        <Box sx={{ width: '100%', maxWidth: '100%', height, display: 'flex', flexDirection: 'column' }}>
            {/* TOP BAR */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 1,
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    {owner && (
                        <Typography variant="body2">
                            {ownerLabel ?? 'Owner'}:{' '}
                            <strong>{owner.name || owner.label || owner.id}</strong>
                        </Typography>
                    )}
                    {orderField && (
                        <Typography variant="caption" color="text.secondary">
                            Wstawianie po:{' '}
                            {prevElementData
                                ? (prevElementData.name || prevElementData[idField])
                                : 'brak (koniec kolejki)'}
                        </Typography>
                    )}
                </Stack>

                <Box sx={{ flexGrow: 1 }} />

                {/* togglery widoczności */}
                <Stack direction="row" spacing={1} sx={{ mr: 1 }}>
                    <Button
                        size="small"
                        variant={showLeft ? 'contained' : 'outlined'}
                        onClick={toggleLeft}
                    >
                        Przypisane
                    </Button>
                    <Button
                        size="small"
                        variant={showRight ? 'contained' : 'outlined'}
                        onClick={toggleRight}
                    >
                        Dostępne
                    </Button>
                </Stack>

                <TextField
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Szukaj po obu tabelach…"
                    sx={{ minWidth: 260 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                        endAdornment: search ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearch('')}>
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    }}
                />
            </Box>

            {/* LAYOUT Z ROZSUWANYM PODZIAŁEM */}
            <Box
                ref={containerRef}
                sx={{
                    flex: 1,
                    display: 'flex',
                    width: '100%',
                    position: 'relative',
                    userSelect: isDragging ? 'none' : 'auto',
                    cursor: isDragging ? 'col-resize' : 'default',
                }}
            >
                {/* LEWA – przypisane */}
                {showLeft && (
                    <Box
                        sx={{
                            flex: '0 0 auto',
                            width: showRight ? `${effectiveLeftRatio * 100}%` : '100%',
                            maxWidth: showRight ? `${effectiveLeftRatio * 100}%` : '100%',
                            minWidth: 0,
                            pr: showRight ? 1 : 0,
                            transition: isDragging
                                ? 'none'
                                : 'max-width 0.2s ease-in-out, width 0.2s ease-in-out',
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                            Przypisane
                        </Typography>
                        <PowerTable
                            entityName={entityName}
                            data={filteredLeftData}
                            columnSchema={leftColumns}
                            height={height - 80}
                            rowHeight={leftRowHeight}
                            treeConfig={null}
                            onEdit={handleEditLeft}
                            onDelete={handleDeleteLeft}
                            // 🔑 lokalna selekcja
                            selected={leftSelected}
                            onSelect={setLeftSelected}
                            // mapper to lekki widget
                            enablePresets={true}
                            enableUpload={false}
                            enableExport={true}
                            showSidebar={true}
                        />
                    </Box>
                )}

                {/* RESIZER */}
                {showResizer && (
                    <Box
                        onMouseDown={handleMouseDown}
                        sx={{
                            flex: '0 0 auto',
                            width: '4px',
                            cursor: 'col-resize',
                            position: 'relative',
                            zIndex: 10,
                            '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.08)',
                            },
                            backgroundColor: isDragging ? 'rgba(0,0,0,0.12)' : 'transparent',
                        }}
                    />
                )}

                {/* PRAWA – dostępne */}
                {showRight && (
                    <Box
                        sx={{
                            flex: '1 1 auto',
                            minWidth: 0,
                            pl: showLeft ? 1 : 0,
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                            Dostępne
                        </Typography>
                        <PowerTable
                            entityName="mapper-right"
                            data={filteredRightData}
                            columnSchema={rightColumnsBase}
                            height={height - 80}
                            rowHeight={rightRowHeight}
                            treeConfig={null}
                            onEdit={null}
                            onDelete={null}
                            // 🔑 prawa strona: nie trzymamy selekcji,
                            // ale reagujemy na select zdarzeniem
                            selected={[]}
                            onSelect={handleSelectRight}
                            enablePresets={false}
                            enableUpload={false}
                            enableExport={false}
                            showSidebar={false}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Mapper;
