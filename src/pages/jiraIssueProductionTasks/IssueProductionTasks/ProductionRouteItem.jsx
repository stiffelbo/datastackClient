import React from "react";

import {
    Box,
    Stack,
    Typography,
    Button,
    Chip,
    Tooltip,
    Divider,
    CircularProgress,
} from "@mui/material";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

import { colorFromString } from "../../../utils/colorHash";

const PERFORMANCE_MODES = [
    {
        key: 'reorder',
        label: 'R',
        title: 'Reorder',
        color: 'success.main',
    },
    {
        key: 'numismatic',
        label: 'N',
        title: 'Numizmat',
        color: 'info.main',
    },
    {
        key: 'category',
        label: 'K',
        title: 'Kategoria',
        color: 'text.secondary',
    },
];

const formatHours = (value) => {
    if (value == null || value === '') return '—';

    const number = Number(value);

    return Number.isFinite(number)
        ? number.toLocaleString('pl-PL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        : '—';
};

// ============================================================
// TASK PERFORMANCE
// ============================================================

const RouteTaskPerformance = ({ task, mode }) => {
    const estimate = task.performance?.[mode.key];
    const selected = task.resolvedPerformance?.mode === mode.key;

    const available = estimate?.neededTime != null
        && Number.isFinite(Number(estimate.neededTime));

    const tooltip = available ? (
        <Stack spacing={0.25}>
            <Typography variant="caption" fontWeight={700}>
                {mode.title}
            </Typography>

            <Typography variant="caption">
                Czas kalkulowany: {formatHours(estimate.neededTime)} h
            </Typography>

            <Typography variant="caption">
                Norma: {Number(estimate.norm).toLocaleString('pl-PL', {
                    maximumFractionDigits: 6,
                })} h/szt.
            </Typography>

            <Typography variant="caption">
                Liczba próbek: {estimate.samplesCount}
            </Typography>

            {selected && (
                <Typography variant="caption" fontWeight={700}>
                    Estymacja wybrana automatycznie
                </Typography>
            )}
        </Stack>
    ) : `${mode.title}: brak estymacji`;

    return (
        <Tooltip title={tooltip} arrow>
            <Box
                sx={{
                    width: 43,
                    flexShrink: 0,
                    px: 0.25,
                    py: 0.4,
                    textAlign: 'center',
                    borderRadius: 0.75,
                    bgcolor: selected ? 'action.selected' : 'transparent',
                }}
            >
                <Typography
                    sx={{
                        fontSize: 11,
                        fontWeight: selected ? 700 : 400,
                        fontVariantNumeric: 'tabular-nums',
                        color: selected
                            ? mode.color
                            : available
                                ? 'text.secondary'
                                : 'text.disabled',
                    }}
                >
                    {formatHours(estimate?.neededTime)}
                </Typography>
            </Box>
        </Tooltip>
    );
};

// ============================================================
// ROUTE TASK
// ============================================================

const RouteTaskItem = ({ task }) => {
    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={0.25}
            sx={{
                py: 0.65,
                minWidth: 0,
                opacity: task.isAvailable === false ? 0.5 : 1,
            }}
        >
            <Box sx={{ flex: 1, minWidth: 0, pr: 0.5 }}>
                <Typography
                    title={task.processName}
                    sx={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        lineHeight: 1.4,
                    }}
                >
                    {task.processName || `Proces #${task.processId}`}
                </Typography>

                {task.isAvailable === false && (
                    <Typography
                        color="error.main"
                        sx={{ fontSize: 10 }}
                    >
                        Proces niedostępny
                    </Typography>
                )}
            </Box>

            {PERFORMANCE_MODES.map(mode => {
                return (
                    <RouteTaskPerformance
                        key={mode.key}
                        task={task}
                        mode={mode}
                    />
                );
            })}
        </Stack>
    );
};

// ============================================================
// ROUTE ITEM
// ============================================================

const ProductionRouteItem = ({
    data,
    index,
    onImport,
    importing = false,
    disabled = false,
}) => {
    const tasks = data.tasks ?? [];
    const color = colorFromString(data.signature ?? String(index));

    const performance = data.resolvedPerformance ?? {};
    const occurrences = Number(data.occurrences) || 0;
    const completedCount = Number(data.completedCount) || 0;

    const estimatedCount = performance.estimatedCount ?? 0;
    const missingCount = performance.missingCount ?? tasks.length;

    const isComplete = performance.isComplete === true;
    const hasEstimate = estimatedCount > 0;
    const isAvailable = data.isAvailable !== false;

    const totalHours = isComplete
        ? performance.neededTime
        : performance.partialTime;

    const totalLabel = hasEstimate
        ? `${isComplete ? '' : '≥ '}${formatHours(totalHours)} h`
        : 'Brak estymacji';

    const estimateColor = isComplete
        ? 'success.main'
        : hasEstimate
            ? 'warning.main'
            : 'text.disabled';

    return (
        <Box
            sx={{
                width: 310,
                minWidth: 310,
                maxWidth: 310,
                border: 1,
                borderColor: 'divider',
                borderTop: 3,
                borderTopColor: color,
                borderRadius: 1.5,
                bgcolor: 'background.paper',
                overflow: 'hidden',
            }}
        >
            {/* Nagłówek */}
            <Box sx={{ px: 1.25, pt: 1.25, pb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                    <AccountTreeOutlinedIcon
                        sx={{ fontSize: 18, color }}
                    />

                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            flex: 1,
                        }}
                    >
                        Marszruta {String(index + 1).padStart(2, '0')}
                    </Typography>

                    <Tooltip title="Liczba historycznych wystąpień">
                        <Chip
                            size="small"
                            icon={<HistoryOutlinedIcon sx={{ fontSize: 13 }} />}
                            label={`${occurrences}×`}
                            variant="outlined"
                            sx={{ height: 21, fontSize: 10 }}
                        />
                    </Tooltip>
                </Stack>

                {/* Statystyki */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: 0.75, mb: 1 }}
                >
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: 11, flex: 1 }}
                    >
                        {tasks.length} procesów
                    </Typography>

                    <Tooltip title="Liczba zakończonych realizacji historycznych">
                        <Stack direction="row" alignItems="center" spacing={0.3}>
                            <CheckCircleOutlineIcon
                                sx={{ fontSize: 13, color: 'text.secondary' }}
                            />

                            <Typography variant="caption" sx={{ fontSize: 11 }}>
                                {completedCount}/{occurrences}
                            </Typography>
                        </Stack>
                    </Tooltip>

                    <Tooltip title={`Estymacje: ${estimatedCount}, brakujące: ${missingCount}`}>
                        <Typography
                            sx={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: estimateColor,
                            }}
                        >
                            Normy {estimatedCount}/{tasks.length}
                        </Typography>
                    </Tooltip>
                </Stack>

                {/* Performance marszruty */}
                <Box
                    sx={{
                        p: 1,
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                    }}
                >
                    <Typography
                        color="text.secondary"
                        sx={{ fontSize: 10.5 }}
                    >
                        Pracochłonność kalkulowana
                    </Typography>

                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                    >
                        <Typography
                            sx={{
                                fontSize: 22,
                                fontWeight: 700,
                                fontVariantNumeric: 'tabular-nums',
                                color: estimateColor,
                            }}
                        >
                            {totalLabel}
                        </Typography>

                        <Stack spacing={0}>
                            {PERFORMANCE_MODES.map(mode => {
                                const count = performance.sources?.[mode.key] ?? 0;

                                return (
                                    <Tooltip
                                        key={mode.key}
                                        title={`${mode.title}: ${count} procesów`}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: 10,
                                                fontWeight: 600,
                                                color: count > 0
                                                    ? mode.color
                                                    : 'text.disabled',
                                            }}
                                        >
                                            {mode.label}: {count}
                                        </Typography>
                                    </Tooltip>
                                );
                            })}
                        </Stack>
                    </Stack>

                    {missingCount > 0 && (
                        <Typography
                            sx={{ fontSize: 10.5, color: 'warning.main' }}
                        >
                            Brak norm dla {missingCount} zadań
                        </Typography>
                    )}
                </Box>

                {/* Import */}
                <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    disableElevation
                    disabled={disabled || importing || !isAvailable}
                    onClick={onImport}
                    startIcon={
                        importing
                            ? <CircularProgress size={14} color="inherit" />
                            : <AddCircleOutlineIcon sx={{ fontSize: 17 }} />
                    }
                    sx={{
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 600,
                        minHeight: 32,
                    }}
                >
                    {importing
                        ? 'Dodawanie...'
                        : `Dodaj całość · ${totalLabel}`}
                </Button>
            </Box>

            <Divider />

            {/* Nagłówki kolumn */}
            <Box sx={{ px: 1.25, pt: 0.75 }}>
                <Stack direction="row" alignItems="center" spacing={0.25}>
                    <Typography
                        color="text.secondary"
                        sx={{ flex: 1, fontSize: 10.5 }}
                    >
                        Proces
                    </Typography>

                    {PERFORMANCE_MODES.map(mode => {
                        return (
                            <Tooltip
                                key={mode.key}
                                title={`${mode.title} [h]`}
                            >
                                <Typography
                                    sx={{
                                        width: 43,
                                        flexShrink: 0,
                                        textAlign: 'center',
                                        fontSize: 10.5,
                                        fontWeight: 700,
                                        color: mode.color,
                                    }}
                                >
                                    {mode.label}
                                </Typography>
                            </Tooltip>
                        );
                    })}
                </Stack>
            </Box>

            {/* Zadania marszruty */}
            <Box sx={{ px: 1.25, py: 0.5 }}>
                <Stack divider={<Divider flexItem />}>
                    {tasks.map((task, taskIndex) => {
                        return (
                            <RouteTaskItem
                                key={`${task.taskId}-${taskIndex}`}
                                task={task}
                            />
                        );
                    })}
                </Stack>
            </Box>

            <Divider />

            {/* Legenda */}
            <Box sx={{ px: 1.25, py: 0.75 }}>
                <Typography
                    color="text.secondary"
                    sx={{ fontSize: 10 }}
                >
                    R — Reorder · N — Numizmat · K — Kategoria
                </Typography>
            </Box>
        </Box>
    );
};

export default ProductionRouteItem;