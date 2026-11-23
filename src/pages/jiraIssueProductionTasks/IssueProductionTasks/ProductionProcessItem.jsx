
import React from "react";

import {
    Box,
    ListItem,
    Stack,
    Typography,
    Tooltip,
    IconButton,
} from "@mui/material";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import CropFreeIcon from '@mui/icons-material/CropFree';
import LastPageIcon from "@mui/icons-material/LastPage";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";

const ProductionProcessItem = ({
    data,
    actions,
    selectedTask = null,
    disabled = false,
}) => {
    const hasSelectedTask = selectedTask?.id != null;

    const afterTooltip = hasSelectedTask
        ? `Dodaj po zadaniu #${selectedTask.id} — ${selectedTask.processName || selectedTask.name || ''}`
        : 'Dodaj na koniec marszruty';

    const handleAddStart = () => {
        if (disabled) return;
        actions.addStart(data);
    };

    const handleAddFree = () => {
        if (disabled) return;
        actions.addFree(data);
    };

    const handleAddEndOrAfter = () => {
        if (disabled) return;

        if (hasSelectedTask) {
            actions.addAfter(data, selectedTask.id);
            return;
        }

        actions.addEnd(data);
    };

    return (
        <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    minHeight: 52,
                    px: 1,
                    py: 0.75,
                    gap: 1,
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
            </Box>
        </ListItem>
    );
};

export default ProductionProcessItem;
