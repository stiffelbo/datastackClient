import React from "react";

import {
    Box,
    ListItem,
    Stack,
    Typography,
    Tooltip,
    IconButton,
} from "@mui/material";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import CropFreeIcon from "@mui/icons-material/CropFree";
import LastPageIcon from "@mui/icons-material/LastPage";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";

const PERFORMANCE_MODES = [
    {
        key: 'reorder',
        label: 'Reorder',
        color: 'success.main',
        description: 'Historia realizacji tego samego produktu',
    },
    {
        key: 'numismatic',
        label: 'Numizmat',
        color: 'info.main',
        description: 'Historia realizacji tego samego numizmatu',
    },
    {
        key: 'category',
        label: 'Kategoria',
        color: 'text.secondary',
        description: 'Historia realizacji tej samej kategorii',
    },
];

const formatNumber = (value, digits = 2) => {
    if (value == null || value === '') return '—';

    const number = Number(value);

    return Number.isFinite(number)
        ? number.toLocaleString('pl-PL', {
            maximumFractionDigits: digits,
        })
        : '—';
};

// ============================================================
// PERFORMANCE
// ============================================================

const PerformanceItem = ({ mode, data }) => {
    const available = data?.neededTime != null
        && Number.isFinite(Number(data.neededTime));

    const tooltip = (
        <Stack spacing={0.5} sx={{ py: 0.5 }}>
            <Typography variant="caption" fontWeight={700}>
                {mode.label}
            </Typography>

            <Typography variant="caption">
                {mode.description}
            </Typography>

            {available ? (
                <>
                    <Typography variant="caption">
                        Czas kalkulowany: {formatNumber(data.neededTime)} h
                    </Typography>

                    <Typography variant="caption">
                        Norma: {formatNumber(data.norm, 6)} h/szt.
                    </Typography>

                    <Typography variant="caption">
                        Liczba próbek: {data.samplesCount}
                    </Typography>

                    <Typography variant="caption">
                        Czas historyczny: {formatNumber(data.totalTime)} h
                    </Typography>

                    <Typography variant="caption">
                        Nakład historyczny: {formatNumber(data.totalQty)} szt.
                    </Typography>
                </>
            ) : (
                <Typography variant="caption">
                    Brak estymacji dla tego procesu.
                </Typography>
            )}
        </Stack>
    );

    return (
        <Tooltip title={tooltip} arrow placement="bottom">
            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    px: 0.75,
                    py: 0.4,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 0.75,
                    bgcolor: 'background.default',
                    opacity: available ? 1 : 0.45,
                }}
            >
                <Typography
                    noWrap
                    sx={{
                        fontSize: 10,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        color: mode.color,
                    }}
                >
                    {mode.label}
                </Typography>

                <Stack
                    direction="row"
                    alignItems="baseline"
                    justifyContent="space-between"
                    spacing={0.5}
                >
                    <Typography
                        noWrap
                        sx={{
                            fontSize: 12,
                            fontWeight: 700,
                            fontVariantNumeric: 'tabular-nums',
                            color: available ? mode.color : 'text.disabled',
                        }}
                    >
                        {available
                            ? `${formatNumber(data.neededTime)} h`
                            : '—'}
                    </Typography>

                    {available && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                fontSize: 9,
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            n={data.samplesCount}
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Tooltip>
    );
};

export const ProcessPerformance = ({ performance }) => (
    <Stack direction="row" spacing={0.5} sx={{ width: '100%' }}>
        {PERFORMANCE_MODES.map(mode => (
            <PerformanceItem
                key={mode.key}
                mode={mode}
                data={performance?.[mode.key]}
            />
        ))}
    </Stack>
);

// ============================================================
// PROCESS ITEM
// ============================================================

const ProductionProcessItem = ({
    data,
    actions,
    selectedTask = null,
    disabled = false,
}) => {
    const hasSelectedTask = selectedTask?.id != null;
    const performance = data.params?.performance;

    const afterTooltip = hasSelectedTask
        ? `Dodaj po zadaniu #${selectedTask.id} — ${selectedTask.processName || selectedTask.name || ''}`
        : 'Dodaj na koniec marszruty';

    const handleAddStart = () => {
        if (disabled) return;
        return actions.addStart(data);
    };

    const handleAddFree = () => {
        if (disabled) return;
        return actions.addFree(data);
    };

    const handleAddEndOrAfter = () => {
        if (disabled) return;

        return hasSelectedTask
            ? actions.addAfter(data)
            : actions.addEnd(data);
    };

    return (
        <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    px: 1,
                    py: 0.75,
                    gap: 0.75,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    opacity: disabled ? 0.5 : 1,
                    transition: 'background-color 120ms, border-color 120ms',
                    '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: disabled ? 'divider' : 'primary.light',
                    },
                }}
            >
                {/* Nagłówek procesu */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                >
                    <PrecisionManufacturingOutlinedIcon
                        sx={{
                            fontSize: 20,
                            color: 'text.secondary',
                            flexShrink: 0,
                        }}
                    />

                    <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                fontSize: 12.5,
                                lineHeight: 1.35,
                            }}
                        >
                            {data.label}
                        </Typography>

                        {data.description && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    fontSize: 11,
                                    lineHeight: 1.3,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {data.description}
                            </Typography>
                        )}
                    </Stack>

                    {/* Operacje */}
                    <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
                        <Tooltip title="Dodaj na początek marszruty">
                            <span>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    disabled={disabled}
                                    onClick={handleAddStart}
                                    sx={{ p: 0.5 }}
                                >
                                    <FirstPageIcon sx={{ fontSize: 19 }} />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title="Dodaj jako niepowiązany element">
                            <span>
                                <IconButton
                                    size="small"
                                    color="default"
                                    disabled={disabled}
                                    onClick={handleAddFree}
                                    sx={{ p: 0.5 }}
                                >
                                    <CropFreeIcon sx={{ fontSize: 19 }} />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title={afterTooltip}>
                            <span>
                                <IconButton
                                    size="small"
                                    color={hasSelectedTask ? 'warning' : 'primary'}
                                    disabled={disabled}
                                    onClick={handleAddEndOrAfter}
                                    sx={{ p: 0.5 }}
                                >
                                    {hasSelectedTask
                                        ? <SubdirectoryArrowRightIcon sx={{ fontSize: 19 }} />
                                        : <LastPageIcon sx={{ fontSize: 19 }} />
                                    }
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                </Stack>

                {/* Estymacje procesu */}
                {performance && (
                    <ProcessPerformance performance={performance} />
                )}
            </Box>
        </ListItem>
    );
};

export default ProductionProcessItem;