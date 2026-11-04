
import React from 'react';

import {
    Box, Chip, Divider, LinearProgress, Stack,
    Tooltip, Typography,
} from '@mui/material';

import {
    CheckCircleOutline,
    ErrorOutline,
    RadioButtonUnchecked,
} from '@mui/icons-material';

export default function OutgoingProgress({ validation, items = [], attachments = [] }) {
    const totalQty = items.reduce(
        (sum, item) => sum + (Number.isFinite(Number(item.qty)) ? Number(item.qty) : 0),
        0
    );

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ minWidth: 0, flexWrap: 'nowrap' }}
        >
            <Divider orientation="vertical" flexItem />

            {/* SEKCJE WALIDACJI */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
                {validation.sections.map(section => {
                    const hasErrors = section.errors.length > 0;
                    const isEmptyOptional = section.optional && !section.count;

                    const Icon = section.valid
                        ? isEmptyOptional ? RadioButtonUnchecked : CheckCircleOutline
                        : ErrorOutline;

                    const color = section.valid
                        ? isEmptyOptional ? 'text.disabled' : 'success.main'
                        : 'warning.main';

                    return (
                        <Tooltip
                            key={section.id}
                            arrow
                            title={
                                <Box>
                                    <Typography variant="caption" fontWeight={600}>
                                        {section.label}
                                    </Typography>
                                    {hasErrors
                                        ? section.errors.map((err, i) => (
                                            <Typography key={i} variant="caption" display="block">
                                                {err}
                                            </Typography>
                                        ))
                                        : (
                                            <Typography variant="caption" display="block">
                                                {isEmptyOptional ? 'Opcjonalne — brak danych' : 'OK'}
                                            </Typography>
                                        )
                                    }
                                </Box>
                            }
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                                sx={{ cursor: 'default', whiteSpace: 'nowrap' }}
                            >
                                <Icon sx={{ fontSize: 18, color }} />
                                <Typography
                                    variant="body2"
                                    color={isEmptyOptional ? 'text.secondary' : 'text.primary'}
                                >
                                    {section.label}
                                </Typography>
                            </Stack>
                        </Tooltip>
                    );
                })}
            </Stack>

            <Divider orientation="vertical" flexItem />

            {/* STATYSTYKI */}
            <Stack direction="row" alignItems="center" spacing={1}>
                <Chip size="small" variant="outlined" label={`Pozycje: ${items.length}`} />
                <Chip size="small" variant="outlined" label={`Ilość: ${totalQty}`} />
                <Chip size="small" variant="outlined" label={`Pliki: ${attachments.length}`} />
            </Stack>
        </Stack>
    );
}
