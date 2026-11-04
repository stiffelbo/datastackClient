import React from 'react';

import {
    Box,
    Stack,
    Typography,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material';

const WhStockEntriesDetailsContent = ({
    row,
    data,
    loading,
    error,
    onRefresh,
}) => {

    if (loading && !data) {
        return (
            <Box sx={{ p: 2 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                Nie udało się pobrać historii magazynowej.
            </Alert>
        );
    }

    if (!data) return null;

    const stock = data.stock ?? row;
    const movements = data.movements ?? [];
    const shifts = data.shifts ?? [];

    return (
        <Stack spacing={2} sx={{ p: 2 }}>

            <Box>
                <Typography variant="h6" fontWeight={700}>
                    {stock?.label}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    {stock?.contractorName}
                </Typography>
            </Box>

            <Divider />

            <Typography variant="subtitle2">
                Historia ruchów magazynowych ({movements.length})
            </Typography>

            <Box
                component="pre"
                sx={{
                    m: 0,
                    p: 1.5,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    fontSize: 12,
                    overflow: 'auto',
                }}
            >
                {JSON.stringify(movements, null, 2)}
            </Box>

            <Typography variant="subtitle2">
                Ruchy wewnętrzne ({shifts.length})
            </Typography>

            <Box
                component="pre"
                sx={{
                    m: 0,
                    p: 1.5,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    fontSize: 12,
                    overflow: 'auto',
                }}
            >
                {JSON.stringify(shifts, null, 2)}
            </Box>

        </Stack>
    );
};

export default WhStockEntriesDetailsContent;