import React from 'react';

import {
    Box,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';

import ActivityItem from './ActivityItem';


const CommentsActivity = ({
    data = [],
    loading = false,
    layout,
    onCreateFileComment,
    onPinn
}) => {

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    py: 4,
                }}
            >
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (!data.length) {
        return (
            <Box sx={{ py: 3 }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                >
                    Brak aktywności.
                </Typography>
            </Box>
        );
    }

    return (
        <Stack
            spacing={1.5}
            sx={{
                width: '100%',
                minWidth: 0,
            }}
        >
            {data.map(item => (
                <ActivityItem
                    key={`${item.type}:${item.id}`}
                    item={item}
                    layout={layout}
                    onCreateFileComment={onCreateFileComment}
                    onPinn={onPinn}
                />
            ))}
        </Stack>
    );
};

export default CommentsActivity;