import React from 'react';

import {
    Box,
    IconButton,
    InputAdornment,
    TextField,
    Tooltip,
} from '@mui/material';

import PushPinIcon from '@mui/icons-material/PushPin';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const CommentsFilters = ({
    filters,
    onChange
}) => {

    const {
        pinnedOnly = false,
        showLogs = true,
        sortDirection = 'desc',
        search = '',
    } = filters ?? {}

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mb: 1,
            }}
        >
            <TextField
                size="small"
                value={search}
                onChange={event => onChange({
                    search: event.target.value,
                })}
                placeholder="Szukaj..."
                sx={{
                    flex: 1,
                    minWidth: 0,
                    '& .MuiInputBase-root': {
                        height: 32,
                        fontSize: '0.8rem',
                    },
                }}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    },
                }}
            />

            <Tooltip title={pinnedOnly ? 'Pokaż wszystkie' : 'Tylko przypięte'}>
                <IconButton
                    size="small"
                    color={pinnedOnly ? 'warning' : 'default'}
                    onClick={() => onChange({
                        pinnedOnly: !pinnedOnly,
                    })}
                >
                    <PushPinIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <Tooltip title={showLogs ? 'Ukryj logi' : 'Pokaż logi'}>
                <IconButton
                    size="small"
                    color={showLogs ? 'primary' : 'default'}
                    onClick={() => onChange({ showLogs: !showLogs })}
                >
                    <HistoryIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <Tooltip
                title={
                    sortDirection === 'desc'
                        ? 'Najnowsze najpierw'
                        : 'Najstarsze najpierw'
                }
            >
                <IconButton
                    size="small"
                    onClick={() => onChange({
                        sortDirection: sortDirection === 'desc'
                            ? 'asc'
                            : 'desc'
                    })}
                >
                    {sortDirection === 'desc'
                        ? <ArrowDownwardIcon fontSize="small" />
                        : <ArrowUpwardIcon fontSize="small" />
                    }
                </IconButton>
            </Tooltip>
        </Box >
    );
};

export default CommentsFilters;