import React from 'react';

import {
    Box,
    Paper,
    Typography,
} from '@mui/material';

const LogItem = ({ log }) => {
    return (
        <Paper
            elevation={0}
            sx={{
                px: 1.25,
                py: 0.75,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 1,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 1,
                    flexWrap: 'wrap',
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                    }}
                >
                    {log.authorName || 'System'}
                </Typography>

                {log.created_at && (
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: '0.68rem',
                            color: 'text.disabled',
                        }}
                    >
                        {log.created_at}
                    </Typography>
                )}

                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                    }}
                >
                    {log.content}
                </Typography>
            </Box>
        </Paper>
    );
};

export default LogItem;