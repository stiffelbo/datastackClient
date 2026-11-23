
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
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

import { colorFromString } from "../../../utils/colorHash";

const ProductionRouteItem = ({
    data,
    index,
    onImport,
    importing = false,
    disabled = false,
}) => {
    const tasks = data.estimatedTasks ?? data.tasks ?? [];
    const color = colorFromString(data.signature ?? String(index));

    const totalHours = Number(data.estimatedTime);
    const hasEstimate = Number.isFinite(totalHours) && data.estimatedTime != null;

    const formatHours = (value) => {
        const number = Number(value);

        return Number.isFinite(number)
            ? number.toLocaleString('pl-PL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
            : '—';
    };

    const occurrences = Number(data.occurrences) || 0;
    const completedCount = Number(data.completedCount) || 0;

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

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: 0.75, mb: 1 }}
                >
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                        {data.tasksCount ?? tasks.length} procesów
                    </Typography>

                    <Tooltip title="Liczba zakończonych realizacji">
                        <Stack direction="row" alignItems="center" spacing={0.3}>
                            <CheckCircleOutlineIcon
                                sx={{ fontSize: 13, color: 'success.main' }}
                            />
                            <Typography variant="caption" sx={{ fontSize: 11 }}>
                                {completedCount}/{occurrences}
                            </Typography>
                        </Stack>
                    </Tooltip>
                </Stack>

                <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    disableElevation
                    disabled={disabled}
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
                        : `Dodaj całość · ${hasEstimate ? `${formatHours(totalHours)} h` : 'brak estymacji'}`}
                </Button>
            </Box>

            <Divider />


            {/* Zadania marszruty */}
            <Box sx={{ px: 1.25, py: 0.75 }}>
                <Stack divider={<Divider flexItem />}>
                    {tasks.map((task, taskIndex) => {
                        const estimate = task.estimatedTime;
                        const hasTaskEstimate = estimate != null
                            && Number.isFinite(Number(estimate));

                        return (
                            <Stack
                                key={`${task.taskId ?? task.processId}-${taskIndex}`}
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                                sx={{ py: 0.75, minWidth: 0 }}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        noWrap
                                        title={task.name || task.processName}
                                        sx={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {task.name || task.processName || `Proces #${task.processId}`}
                                    </Typography>

                                    {task.processName && task.name !== task.processName && (
                                        <Typography
                                            noWrap
                                            color="text.secondary"
                                            sx={{ fontSize: 10.5 }}
                                        >
                                            {task.processName}
                                        </Typography>
                                    )}
                                </Box>

                                {task.category && (
                                    <Typography
                                        noWrap
                                        color="text.disabled"
                                        sx={{ fontSize: 10, maxWidth: 110 }}
                                    >
                                        {task.category}
                                    </Typography>
                                )}

                                <Tooltip title="Szacowany czas dla aktualnego nakładu">
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.4}
                                        sx={{ flexShrink: 0, minWidth: 65, justifyContent: 'flex-end' }}
                                    >
                                        <AccessTimeOutlinedIcon
                                            sx={{ fontSize: 14, color: 'text.disabled' }}
                                        />
                                        <Typography
                                            sx={{
                                                fontSize: 11,
                                                fontWeight: 600,
                                                fontVariantNumeric: 'tabular-nums',
                                                color: hasTaskEstimate ? 'text.primary' : 'warning.main',
                                            }}
                                        >
                                            {hasTaskEstimate
                                                ? `${formatHours(estimate)} h`
                                                : 'Brak normy'}
                                        </Typography>
                                    </Stack>
                                </Tooltip>
                            </Stack>
                        );
                    })}
                </Stack>
            </Box>


            {/* Stopka */}
            <Divider />

            <Box sx={{ px: 1.25, py: 0.75 }}>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: 10.5 }}
                >
                    Sygnatura: {data.signature ?? '—'}
                </Typography>
            </Box>
        </Box>
    );
};

export default ProductionRouteItem;
