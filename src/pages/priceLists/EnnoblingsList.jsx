import React, { useState } from 'react';

import {
    Box,
    Stack,
    Typography,
    TextField,
    InputAdornment,
    List,
    Divider,
    Alert,
    Collapse,
    IconButton,
    Tooltip,
    Button,
} from '@mui/material';

import { colorFromString } from '../../utils/colorHash';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PlaylistAddOutlinedIcon from '@mui/icons-material/PlaylistAddOutlined';

import EnnoblingItem from './EnnoblingItem';

const normalize = (value) => String(value ?? '')
    .toLocaleLowerCase('pl-PL')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l');

const getGroup = (item) =>
    item.type?.trim()
    || 'Pozostałe uszlachetnienia';

const EnnoblingsList = ({ priceList }) => {
    const [search, setSearch] = useState('');
    const [collapsedGroups, setCollapsedGroups] = useState({});

    const {
        available,
        busy,
        actions,
        itemsEntity,
    } = priceList;

    const disabled = busy || !itemsEntity.upload;
    const searching = search.trim().length > 0;
    const searchValue = normalize(search.trim());

    // =========================================================
    // FILTERING & GROUPING
    // =========================================================

    const filtered = available.filter(item => {
        const text = [
            item.name,
            item.code,
            item.description,
            item.price_list_name_pl,
            item.price_list_name_en,
            item.side,
            item.type,
        ].join(' ');

        return normalize(text).includes(searchValue);
    });

    const groups = Object.groupBy(filtered, getGroup);

    const groupNames = Object.keys(groups).sort(
        (a, b) => a.localeCompare(b, 'pl')
    );

    const isGroupOpen = (group) =>
        searching || !collapsedGroups[group];

    const toggleGroup = (group) => {
        if (searching) return;

        setCollapsedGroups(prev => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    const collapseAll = () => {
        setCollapsedGroups(
            Object.fromEntries(
                groupNames.map(group => [group, true])
            )
        );
    };

    const expandAll = () => setCollapsedGroups({});

    const allCollapsed = groupNames.length > 0
        && groupNames.every(group => collapsedGroups[group]);

    // =========================================================
    // ACTIONS
    // =========================================================

    const handleAddGroup = (group) => {
        const ids = groups[group].map(item => item.id);
        return actions.add(ids);
    };

    const handleAddVisible = () => {
        return searching
            ? actions.add(filtered.map(item => item.id))
            : actions.addAll();
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
                bgcolor: 'background.paper',
            }}
        >
            {/* Wyszukiwarka */}
            <Box sx={{ px: 1, pt: 1, pb: 0.75 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TextField
                        fullWidth
                        size="small"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Szukaj uszlachetnienia..."
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchOutlinedIcon sx={{ fontSize: 18 }} />
                                    </InputAdornment>
                                ),
                                sx: { fontSize: 12.5 },
                            },
                        }}
                    />

                    <Tooltip title={allCollapsed
                        ? 'Rozwiń wszystkie grupy'
                        : 'Zwiń wszystkie grupy'}
                    >
                        <span>
                            <IconButton
                                size="small"
                                disabled={searching || !groupNames.length}
                                onClick={allCollapsed ? expandAll : collapseAll}
                                sx={{ p: 0.65 }}
                            >
                                {allCollapsed
                                    ? <UnfoldMoreIcon sx={{ fontSize: 19 }} />
                                    : <UnfoldLessIcon sx={{ fontSize: 19 }} />
                                }
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
            </Box>

            {/* Dodawanie wszystkich */}
            <Box sx={{ px: 1, pb: 1 }}>
                <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<PlaylistAddOutlinedIcon />}
                    disabled={disabled || !filtered.length}
                    onClick={handleAddVisible}
                    sx={{
                        fontSize: 11.5,
                        textTransform: 'none',
                        minHeight: 30,
                    }}
                >
                    {searching
                        ? `Dodaj wyniki wyszukiwania (${filtered.length})`
                        : `Dodaj wszystkie (${available.length})`
                    }
                </Button>
            </Box>

            <Divider />

            {/* Lista grup */}
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    p: 0.75,
                }}
            >
                {!groupNames.length && (
                    <Alert severity="info" sx={{ fontSize: 12 }}>
                        {searching
                            ? 'Nie znaleziono uszlachetnień.'
                            : 'Brak dostępnych uszlachetnień do dodania.'
                        }
                    </Alert>
                )}

                {groupNames.map(group => {
                    const data = groups[group];
                    const open = isGroupOpen(group);
                    const color = colorFromString(group);

                    return (
                        <Box key={group} sx={{ mb: 0.75 }}>
                            {/* Nagłówek grupy */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    px: 0.5,
                                    py: 0.4,
                                    minHeight: 34,
                                    borderRadius: 1,
                                    borderLeft: 3,
                                    borderLeftColor: color,
                                    bgcolor: colorFromString(group, {
                                        opacity: open ? 0.10 : 0.035,
                                    }),
                                }}
                            >
                                <Box
                                    role="button"
                                    tabIndex={searching ? -1 : 0}
                                    aria-expanded={open}
                                    onClick={() => toggleGroup(group)}
                                    onKeyDown={event => {
                                        if (
                                            event.key === 'Enter'
                                            || event.key === ' '
                                        ) {
                                            event.preventDefault();
                                            toggleGroup(group);
                                        }
                                    }}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flex: 1,
                                        minWidth: 0,
                                        gap: 0.5,
                                        cursor: searching
                                            ? 'default'
                                            : 'pointer',
                                    }}
                                >
                                    {open
                                        ? <KeyboardArrowDownIcon sx={{ fontSize: 18, color }} />
                                        : <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />
                                    }

                                    <CategoryOutlinedIcon
                                        sx={{ fontSize: 15, color }}
                                    />

                                    <Tooltip title={group}>
                                        <Typography
                                            variant="caption"
                                            noWrap
                                            sx={{
                                                flex: 1,
                                                fontWeight: 700,
                                                fontSize: 11.5,
                                            }}
                                        >
                                            {group}
                                        </Typography>
                                    </Tooltip>

                                    <Box
                                        sx={{
                                            px: 0.75,
                                            py: 0.2,
                                            borderRadius: 0.75,
                                            bgcolor: colorFromString(group, {
                                                opacity: 0.16,
                                            }),
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontSize: 10,
                                                fontWeight: 700,
                                                color,
                                            }}
                                        >
                                            {data.length}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Tooltip title={`Dodaj grupę (${data.length})`}>
                                    <span>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            disabled={disabled}
                                            onClick={() => handleAddGroup(group)}
                                            sx={{ p: 0.4 }}
                                        >
                                            <AddOutlinedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>

                            {/* Pozycje grupy */}
                            <Collapse in={open} timeout={180} unmountOnExit>
                                <List
                                    disablePadding
                                    sx={{
                                        pt: 0.5,
                                        pl: 0.75,
                                        ml: 0.25,
                                        borderLeft: 1,
                                        borderLeftColor: colorFromString(group, {
                                            opacity: 0.25,
                                        }),
                                    }}
                                >
                                    {data.map(item => (
                                        <EnnoblingItem
                                            key={item.id}
                                            data={item}
                                            disabled={disabled}
                                            onAdd={id => actions.add([id])}
                                        />
                                    ))}
                                </List>
                            </Collapse>
                        </Box>
                    );
                })}
            </Box>

            <Divider />

            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ px: 1, py: 0.5, fontSize: 10.5 }}
            >
                Widoczne: {filtered.length} / {available.length}
            </Typography>
        </Box>
    );
};

export default EnnoblingsList;