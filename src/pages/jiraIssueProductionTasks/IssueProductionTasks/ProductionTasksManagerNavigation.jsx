
import React from "react";

import {
    Box,
    Stack,
    Typography,
    IconButton,
    Tooltip,
    Divider,
    Chip,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";

import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";

import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";


const ProductionTasksManagerNavigation = ({ production }) => {
    const { tasks = [], ui, bulk, refresh, loading } = production;

    const selectedTask = tasks.find(
        task => String(task.id) === String(ui.selectedTaskId)
    );

    const selectedCount = ui.selectedTaskIds?.length ?? 0;
    const routesCount = production.routeSuggestions?.length ?? 0;
    const activePanel = ui.panel;

    const togglePanel = panel => {
        if (activePanel === panel) {
            ui.closePanel();
        } else {
            ui.openPanel(panel);
        }
    };

    const iconSx = {
        p: 0.65,
        borderRadius: 1,
        '& .MuiSvgIcon-root': {
            fontSize: 19,
        },
    };

    const activeSx = {
        bgcolor: 'action.selected',
        color: 'primary.main',
    };

    return (
        <Box
            sx={{
                width: '100%',
                py: 0.5,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ minHeight: 34 }}
            >
                {/* OPERACJE NA MARSZRUCIE */}

                <Tooltip title="Dodaj proces do marszruty">
                    <IconButton
                        size="small"
                        aria-label="Dodaj proces do marszruty"
                        sx={{
                            ...iconSx,
                            ...(activePanel === 'processes' ? activeSx : {}),
                        }}
                        onClick={() => togglePanel('processes')}
                    >
                        <AddCircleOutlineIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title={`Historyczne marszruty (${routesCount})`}>
                    <IconButton
                        size="small"
                        aria-label="Historyczne marszruty"
                        sx={{
                            ...iconSx,
                            ...(activePanel === 'routes' ? activeSx : {}),
                        }}
                        onClick={() => togglePanel('routes')}
                    >
                        <RouteOutlinedIcon />
                    </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.75 }} />

                {/* OPERACJE */}

                <Tooltip title="Przelicz estymacje czasów">
                    <span>
                        <IconButton
                            size="small"
                            sx={iconSx}
                            disabled={loading || !tasks.length}
                            onClick={() => bulk.estimate()}
                        >
                            <CalculateOutlinedIcon />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title="Odśwież dane">
                    <span>
                        <IconButton
                            size="small"
                            sx={iconSx}
                            disabled={loading}
                            onClick={() => refresh()}
                        >
                            <RefreshOutlinedIcon />
                        </IconButton>
                    </span>
                </Tooltip>

                <Box sx={{ flex: 1, minWidth: 8 }} />

                {/* ZAZNACZENIE */}

                {selectedCount > 1 && (
                    <Tooltip title="Liczba zaznaczonych zadań">
                        <Chip
                            size="small"
                            color="primary"
                            variant="outlined"
                            icon={<ChecklistOutlinedIcon sx={{ fontSize: 15 }} />}
                            label={selectedCount}
                            sx={{ height: 23, fontSize: 11 }}
                        />
                    </Tooltip>
                )}

                {selectedTask && (
                    <Tooltip
                        title={
                            <Box>
                                <Typography variant="caption" display="block">
                                    Zadanie #{selectedTask.id}
                                </Typography>
                                <Typography variant="body2">
                                    {selectedTask.name}
                                </Typography>
                                <Typography variant="caption">
                                    {selectedTask.processName ?? ''}
                                </Typography>
                            </Box>
                        }
                    >
                        <Chip
                            size="small"
                            color="primary"
                            variant="outlined"
                            label={`${selectedTask.sequence_no ?? '—'}. ${selectedTask.name ?? selectedTask.processName ?? 'Zadanie'}`}
                            onDelete={() => ui.selectTask(null)}
                            deleteIcon={<CloseOutlinedIcon sx={{ fontSize: 15 }} />}
                            sx={{
                                maxWidth: 260,
                                height: 24,
                                fontSize: 11,
                                '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                },
                            }}
                        />
                    </Tooltip>
                )}

                {!selectedTask && (
                    <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ fontSize: 11, whiteSpace: 'nowrap' }}
                    >
                        Nie wybrano zadania
                    </Typography>
                )}
            </Stack>
        </Box>
    );
};

export default ProductionTasksManagerNavigation;
