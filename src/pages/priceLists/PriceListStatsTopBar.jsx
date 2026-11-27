import React from 'react';

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
} from '@mui/material';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';

const formatNumber = value =>
    Number(value ?? 0).toLocaleString('pl-PL');

const PriceListStatsTopBar = ({ stats }) => {
    const {
        row,
        summary,
        loading,
        ui,
        actions,
    } = stats;

    const handleViewChange = (event, value) => {
        if (value !== null) {
            ui.setView(value);
        }
    };

    return (
        <Box sx={{ bgcolor: 'background.paper', flexShrink: 0 }}>
            <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{
                    px: 1,
                    py: 0.5,
                    minHeight: 40,
                }}
            >
                <Tooltip title="Odśwież dane">
                    <span>
                        <IconButton
                            size="small"
                            disabled={loading}
                            onClick={actions.refresh}
                        >
                            <RefreshOutlinedIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Divider orientation="vertical" flexItem />

                <ToggleButtonGroup
                    exclusive
                    size="small"
                    color="primary"
                    value={ui.view}
                    onChange={handleViewChange}
                    sx={{
                        '& .MuiToggleButton-root': {
                            px: 1,
                            py: 0.4,
                            gap: 0.75,
                            fontSize: 11.5,
                            textTransform: 'none',
                        },
                    }}
                >
                    <ToggleButton value="orders">
                        <FolderOutlinedIcon sx={{ fontSize: 17 }} />
                        Projekty
                    </ToggleButton>

                    <ToggleButton value="ennoblings">
                        <LayersOutlinedIcon sx={{ fontSize: 17 }} />
                        Uszlachetnienia
                    </ToggleButton>
                </ToggleButtonGroup>

                <Divider orientation="vertical" flexItem />

                <Chip
                    size="small"
                    variant="outlined"
                    label={`Zlecenia: ${formatNumber(summary.ordersCount)}`}
                    sx={{ height: 22, fontSize: 11 }}
                />

                <Chip
                    size="small"
                    variant="outlined"
                    label={`Uszlachetnienia: ${formatNumber(summary.ennoblingsCount)}`}
                    sx={{ height: 22, fontSize: 11 }}
                />

                <Box sx={{ flex: 1 }} />

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: 11.5 }}
                >
                    Nakład zamówiony:
                </Typography>

                <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, fontSize: 12 }}
                >
                    {formatNumber(summary.qtyOrdered)} szt.
                </Typography>

                {row?.currency && (
                    <Chip
                        size="small"
                        label={row.currency}
                        sx={{
                            height: 21,
                            fontSize: 10.5,
                            fontWeight: 700,
                        }}
                    />
                )}
            </Stack>
        </Box>
    );
};

export default PriceListStatsTopBar;