
import React, { useState } from "react";

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
} from "@mui/material";

import { colorFromString } from '../../../utils/colorHash';

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";

import ProductionProcessItem from "./ProductionProcessItem";

const ProductionProcessesList = ({ production }) => {
    const [search, setSearch] = useState('');
    const [performanceOnly, setPerformanceOnly] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState({});

    const {
        processes,
        selectedTask,
        loading,
        actions,
        ui,
    } = production;

    const selectedTaskId = ui.selectedTaskId;
    const searching = search.trim().length > 0;

    const normalize = (value) => String(value ?? '')
        .toLocaleLowerCase('pl-PL')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ł/g, 'l');

    const searchValue = normalize(search.trim());

    const filtered = processes.filter(process => {
        if (performanceOnly && !process.params?.hasPerformance) {
            return false;
        }

        const text = [
            process.label,
            process.description,
            process.category,
            process.group,
            process.value,
        ].join(' ');

        return normalize(text).includes(searchValue);
    });

    const groups = Object.groupBy(
        filtered,
        process => process.group || 'Pozostałe procesy'
    );

    const groupNames = Object.keys(groups);

    const isGroupOpen = (group) =>
        searching || !collapsedGroups[group];

    const toggleGroup = (group) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    const collapseAll = () => {
        setCollapsedGroups(
            Object.fromEntries(groupNames.map(group => [group, true]))
        );
    };

    const expandAll = () => {
        setCollapsedGroups({});
    };

    const allCollapsed = groupNames.length > 0
        && groupNames.every(group => collapsedGroups[group]);

    const { addStart, addAfter, addEnd, addFree } = actions;

    const addActions = {
        addStart,
        addAfter,
        addEnd,
        addFree,
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
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Szukaj procesu..."
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
                    <Tooltip
                        title={performanceOnly
                            ? 'Pokaż wszystkie procesy'
                            : 'Pokaż tylko procesy z estymacją'}
                    >
                        <IconButton
                            size="small"
                            color={performanceOnly ? 'primary' : 'default'}
                            onClick={() => setPerformanceOnly(prev => !prev)}
                            aria-pressed={performanceOnly}
                            sx={{
                                p: 0.65,
                                bgcolor: performanceOnly ? 'action.selected' : 'transparent',
                            }}
                        >
                            <QueryStatsOutlinedIcon sx={{ fontSize: 19 }} />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={allCollapsed ? 'Rozwiń wszystkie grupy' : 'Zwiń wszystkie grupy'}>
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

            <Divider />

            {/* Lista grup */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 0.75 }}>
                {groupNames.length === 0 && (
                    <Alert severity="info" sx={{ fontSize: 12 }}>
                        Nie znaleziono procesów.
                    </Alert>
                )}

                {Object.entries(groups).map(([group, processes]) => {
                    const open = isGroupOpen(group);
                    const color = colorFromString(group);
                    const background = colorFromString(group, {
                        opacity: open ? 0.10 : 0.035,
                    });

                    return (
                        <Box key={group} sx={{ mb: 0.75 }}>
                            {/* Nagłówek grupy */}
                            <Box
                                role="button"
                                tabIndex={0}
                                aria-expanded={open}
                                onClick={() => !searching && toggleGroup(group)}
                                onKeyDown={(event) => {
                                    if (!searching && (event.key === 'Enter' || event.key === ' ')) {
                                        event.preventDefault();
                                        toggleGroup(group);
                                    }
                                }}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.75,
                                    px: 1,
                                    py: 0.75,
                                    minHeight: 34,
                                    borderRadius: 1,
                                    borderLeft: 3,
                                    borderLeftColor: color,
                                    bgcolor: background,
                                    cursor: searching ? 'default' : 'pointer',
                                    transition: 'background-color 150ms',
                                    '&:hover': {
                                        bgcolor: colorFromString(group, { opacity: 0.15 }),
                                    },
                                }}
                            >
                                {open
                                    ? <KeyboardArrowDownIcon sx={{ fontSize: 18, color }} />
                                    : <KeyboardArrowRightIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                }

                                <CategoryOutlinedIcon
                                    sx={{
                                        fontSize: 15,
                                        color: open ? color : 'text.secondary',
                                    }}
                                />

                                <Typography
                                    variant="caption"
                                    noWrap
                                    sx={{
                                        flex: 1,
                                        fontWeight: 700,
                                        fontSize: 11.5,
                                        color: open ? 'text.primary' : 'text.secondary',
                                    }}
                                >
                                    {group}
                                </Typography>

                                <Box
                                    sx={{
                                        minWidth: 22,
                                        height: 19,
                                        px: 0.6,
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: colorFromString(group, {
                                            opacity: open ? 0.16 : 0.08,
                                        }),
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: open ? color : 'text.secondary',
                                        }}
                                    >
                                        {processes.length}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Procesy */}
                            <Collapse in={open} timeout={180} unmountOnExit>
                                <List
                                    disablePadding
                                    sx={{
                                        pt: 0.5,
                                        pl: 0.75,
                                        borderLeft: 1,
                                        borderLeftColor: colorFromString(group, { opacity: 0.25 }),
                                        ml: 0.25,
                                    }}
                                >
                                    {processes.map(process => (
                                        <ProductionProcessItem
                                            key={process.value}
                                            data={process}
                                            actions={addActions}
                                            selectedTask={selectedTask}
                                            disabled={loading}
                                        />
                                    ))}
                                </List>
                            </Collapse>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default ProductionProcessesList;
