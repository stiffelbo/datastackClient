import React from "react";

import {
    Box,
    Stack,
    Typography,
    LinearProgress,
    Tooltip,
    Divider,
} from "@mui/material";

import { Handle, Position } from "@xyflow/react";

import ProductionTaskActions from "../ProductionTaskActions";

const formatNumber = (value, digits = 0) => {
    if (value == null || !Number.isFinite(Number(value))) return '—';

    return Number(value).toLocaleString('pl-PL', {
        maximumFractionDigits: digits,
    });
};

const formatTime = (value) => {
    return value == null ? '—' : `${formatNumber(value, 2)} h`;
};

const TaskMetric = ({ label, value, color = 'text.primary' }) => {
    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography
                noWrap
                color="text.secondary"
                sx={{ fontSize: 10, lineHeight: 1.2 }}
            >
                {label}
            </Typography>

            <Typography
                noWrap
                color={color}
                sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.4,
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
};

const ProductionTaskNode = ({ data, selected }) => {
    const {
        task,
        process,
        actions,
        ui,
        loading,
        color = '#90a4ae',
        direction = 'TB',
    } = data;

    const isHorizontal = direction === 'LR';
    const isDone = task.is_done;
    const hasQuantity = task.target_qty > 0;

    const processName = process?.label
        ?? `Proces #${task.process_id ?? '—'}`;

    const progress = Number(task._progress_pct ?? 0);
    const progressValue = Math.max(0, Math.min(100, progress));

    const statusColor = isDone
        ? 'success.main'
        : task._is_overdue
            ? 'error.main'
            : task.reported_time > 0 || task.current_qty > 0
                ? 'primary.main'
                : 'text.secondary';

    const handleStyle = {
        width: 12,
        height: 12,
        background: loading ? '#bdbdbd' : color,
        border: '2px solid #fff',
        boxShadow: `0 0 0 1px ${color}`,
        cursor: loading ? 'default' : 'crosshair',
        zIndex: 3,
    };

    const sectionSx = {
        px: 1.25,
        py: 0.75,
        minWidth: 0,
        overflow: 'hidden',
    };

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',

                bgcolor: 'background.paper',

                border: '2px solid',
                borderColor: color,
                borderRadius: 1.5,

                boxShadow: selected
                    ? `0 0 0 3px ${color}40, 0 4px 12px #00000020`
                    : 1,

                overflow: 'visible',
            }}
        >
            <Handle
                type="target"
                position={isHorizontal ? Position.Left : Position.Top}
                isConnectable={!loading}
                style={handleStyle}
            />

            {/* GŁÓWNA ZAWARTOŚĆ */}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.45fr 1.7fr',
                    flex: 1,
                    minHeight: 0,
                }}
            >
                {/* 1. IDENTYFIKACJA */}

                <Box sx={sectionSx}>
                    <Typography
                        color="text.disabled"
                        sx={{ fontSize: 10, lineHeight: 1.2 }}
                    >
                        {task.sequence_no} · #{task.id}
                    </Typography>

                    <Tooltip title={processName}>
                        <Typography
                            noWrap
                            sx={{
                                mt: 0.25,
                                fontSize: 14,
                                fontWeight: 700,
                                lineHeight: 1.4,
                                color,
                            }}
                        >
                            {processName}
                        </Typography>
                    </Tooltip>

                    <Tooltip title={task.name || ''}>
                        <Typography
                            noWrap
                            sx={{
                                fontSize: 12,
                                fontWeight: 500,
                                lineHeight: 1.4,
                            }}
                        >
                            {task.name || '—'}
                        </Typography>
                    </Tooltip>

                    <Tooltip title={task.description || ''}>
                        <Typography
                            noWrap
                            color="text.secondary"
                            sx={{
                                mt: 0.25,
                                fontSize: 10.5,
                                lineHeight: 1.3,
                            }}
                        >
                            {task.description || ' '}
                        </Typography>
                    </Tooltip>
                </Box>

                {/* 2. REALIZACJA ILOŚCIOWA */}

                <Box
                    sx={{
                        ...sectionSx,
                        borderLeft: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Typography
                        color="text.secondary"
                        sx={{ fontSize: 10, lineHeight: 1.2 }}
                    >
                        Realizacja ilościowa
                    </Typography>

                    {hasQuantity ? (
                        <>
                            <Stack
                                direction="row"
                                alignItems="baseline"
                                justifyContent="space-between"
                                spacing={0.5}
                                sx={{ mt: 0.5 }}
                            >
                                <Typography
                                    noWrap
                                    sx={{
                                        fontSize: 16,
                                        fontWeight: 600,
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    {formatNumber(task.current_qty, 2)}

                                    <Box
                                        component="span"
                                        sx={{
                                            fontWeight: 400,
                                            color: 'text.secondary',
                                        }}
                                    >
                                        {' / '}
                                        {formatNumber(task.target_qty, 2)}
                                    </Box>
                                </Typography>

                                <Typography
                                    color={statusColor}
                                    sx={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                    }}
                                >
                                    {formatNumber(progress, 1)}%
                                </Typography>
                            </Stack>

                            <LinearProgress
                                variant="determinate"
                                value={progressValue}
                                color={isDone ? 'success' : 'primary'}
                                sx={{
                                    mt: 0.5,
                                    height: 5,
                                    borderRadius: 1,
                                }}
                            />

                            <Typography
                                noWrap
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                    fontSize: 10,
                                }}
                            >
                                Pozostało: {formatNumber(task._remaining_qty, 2)} szt.
                            </Typography>
                        </>
                    ) : (
                        <Typography
                            color="text.secondary"
                            sx={{ fontSize: 11, mt: 1 }}
                        >
                            Bez nakładu ilościowego
                        </Typography>
                    )}
                </Box>

                {/* 3. CZASY PRODUKCYJNE */}

                <Box
                    sx={{
                        ...sectionSx,
                        borderLeft: 1,
                        borderColor: 'divider',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        columnGap: 1,
                        rowGap: 0.5,
                        alignContent: 'center',
                    }}
                >
                    <TaskMetric
                        label="Plan"
                        value={formatTime(task._norm_effective)}
                    />

                    <TaskMetric
                        label="Raport"
                        value={formatTime(task.reported_time)}
                    />

                    <TaskMetric
                        label="Pozostało"
                        value={formatTime(task._remaining_time)}
                    />

                    <TaskMetric
                        label="Prognoza"
                        value={formatTime(task._estimated_total_time)}
                        color={
                            task._norm_effective > 0
                                && task._estimated_total_time > task._norm_effective
                                ? 'error.main'
                                : 'text.primary'
                        }
                    />
                </Box>
            </Box>

            <Divider />

            {/* DOLNA BELKA INFORMACYJNO-OPERACYJNA */}

            <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{
                    px: 1,
                    height: 28,
                    flexShrink: 0,
                    bgcolor: 'action.hover',
                    borderBottomLeftRadius: 5,
                    borderBottomRightRadius: 5,
                }}
            >
                {/* STATUS */}

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                >
                    <Box
                        sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: statusColor,
                        }}
                    />

                    <Typography
                        noWrap
                        color={statusColor}
                        sx={{
                            fontSize: 10.5,
                            fontWeight: 600,
                        }}
                    >
                        {task._progress_status}
                    </Typography>
                </Stack>

                {/* OBSADA */}

                <Typography
                    noWrap
                    color="text.secondary"
                    sx={{ fontSize: 10 }}
                >
                    Obsada: {task.persons ?? 1} os.
                </Typography>

                {task._is_overdue && !isDone && (
                    <Typography
                        noWrap
                        color="error.main"
                        sx={{
                            fontSize: 10,
                            fontWeight: 600,
                        }}
                    >
                        Po terminie
                    </Typography>
                )}

                <Box sx={{ flex: 1 }} />

                {/* AKCJE */}

                <ProductionTaskActions
                    task={task}
                    actions={actions}
                    ui={ui}
                    disabled={loading}
                />
            </Stack>

            <Handle
                type="source"
                position={isHorizontal ? Position.Right : Position.Bottom}
                isConnectable={!loading}
                style={handleStyle}
            />
        </Box>
    );
};

export default ProductionTaskNode;