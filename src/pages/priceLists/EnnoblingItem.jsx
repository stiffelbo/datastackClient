import React from 'react';

import {
    Box,
    Stack,
    Typography,
    ListItem,
    IconButton,
    Tooltip,
} from '@mui/material';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import TollOutlinedIcon from '@mui/icons-material/TollOutlined';

const EnnoblingItem = ({
    data,
    onAdd,
    disabled = false,
}) => {
    const {
        id,
        name,
        code,
        description,
        side,
        type,
        color_hex,
    } = data;

    const color = /^#[0-9a-f]{6}$/i.test(color_hex ?? '')
        ? color_hex
        : null;

    return (
        <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 0.75,
                    py: 0.65,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    opacity: disabled ? 0.6 : 1,
                    transition: 'background-color 120ms, border-color 120ms',
                    '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: disabled ? 'divider' : 'primary.light',
                    },
                }}
            >
                {color ? (
                    <Box
                        sx={{
                            width: 14,
                            height: 14,
                            flexShrink: 0,
                            borderRadius: 0.75,
                            bgcolor: color,
                            border: 1,
                            borderColor: 'divider',
                        }}
                    />
                ) : (
                    <TollOutlinedIcon
                        sx={{
                            fontSize: 18,
                            color: 'text.secondary',
                            flexShrink: 0,
                        }}
                    />
                )}

                <Tooltip
                    title={description || name}
                    placement="right"
                    arrow
                >
                    <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                fontSize: 12,
                                lineHeight: 1.35,
                            }}
                        >
                            {name}
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            flexWrap="wrap"
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    color: 'primary.main',
                                }}
                            >
                                {code}
                            </Typography>

                            {side && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: 10 }}
                                >
                                    · {side}
                                </Typography>
                            )}

                            {type && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: 10 }}
                                >
                                    · {type}
                                </Typography>
                            )}
                        </Stack>
                    </Stack>
                </Tooltip>

                <Tooltip title="Dodaj do cennika">
                    <span>
                        <IconButton
                            size="small"
                            color="primary"
                            disabled={disabled}
                            onClick={() => onAdd(id)}
                            sx={{ p: 0.5 }}
                        >
                            <AddOutlinedIcon sx={{ fontSize: 19 }} />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        </ListItem>
    );
};

export default EnnoblingItem;