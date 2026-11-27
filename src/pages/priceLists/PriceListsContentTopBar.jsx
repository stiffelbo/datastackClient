import React from 'react';

import {
    Box,
    Stack,
    Typography,
    IconButton,
    ToggleButton,
    Tooltip,
    Divider,
    Chip,
    Collapse,
} from '@mui/material';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import HighlightOutlinedIcon from '@mui/icons-material/HighlightOutlined';

const PriceListContentTopBar = ({ priceList }) => {
    const {
        row,
        items,
        available,
        busy,
        ui,
        actions,
        itemsEntity
    } = priceList;

    const selectedCount = ui.selectedIds.length;

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
                <Tooltip title={ui.showEnnoblings
                    ? 'Ukryj katalog uszlachetnień'
                    : 'Dodaj pozycje do cennika'}
                >
                    <IconButton
                        size="small"
                        color={ui.showEnnoblings ? 'primary' : 'default'}
                        onClick={ui.toggleEnnoblings}
                        sx={{
                            bgcolor: ui.showEnnoblings
                                ? 'action.selected'
                                : 'transparent',
                        }}
                    >
                        <AddOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Odśwież dane">
                    <span>
                        <IconButton
                            size="small"
                            disabled={busy}
                            onClick={actions.refresh}
                        >
                            <RefreshOutlinedIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Divider orientation="vertical" flexItem />

                <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, fontSize: 12 }}
                >
                    Pozycje: {items.length}
                </Typography>

                <Chip
                    size="small"
                    variant="outlined"
                    label={`Dostępne: ${available.length}`}
                    sx={{ height: 21, fontSize: 10.5 }}
                />

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

                <Box sx={{ flex: 1 }} />

                {selectedCount > 0 && (
                    <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={`Zaznaczono: ${selectedCount}`}
                        sx={{ height: 22, fontSize: 11 }}
                    />
                )}

                <Divider orientation="vertical" flexItem />

                <Tooltip title={ui.indicateEmpty
                    ? 'Wyłącz podświetlanie brakujących cen'
                    : 'Podświetl brakujące ceny'}
                >
                    <ToggleButton
                        value="indicateEmpty"
                        selected={ui.indicateEmpty}
                        onChange={ui.indicate}
                        size="small"
                        color="info"
                        sx={{
                            p: 0.5,
                            border: 0,
                            borderRadius: 1,
                        }}
                    >
                        <HighlightOutlinedIcon fontSize="small" />
                    </ToggleButton>
                </Tooltip>
            </Stack>
        </Box>
    );
};

export default PriceListContentTopBar;