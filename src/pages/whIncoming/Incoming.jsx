import React from 'react';

import {
    Box, Button, CircularProgress, Paper, Stack, Typography,
    Collapse, IconButton, LinearProgress, Tooltip,
} from '@mui/material';

import {
    SaveOutlined,
    KeyboardArrowDown,
    KeyboardArrowUp,
    CheckCircleOutline,
    ErrorOutline,
} from '@mui/icons-material';

import { useRwd } from '../../context/RwdContext';
import useIncoming from './useIncoming';
import Shipping from './Shipping';
import IncomingFiles from './IncomingFiles';
import IncomingContent from './IncomingContent';
import IncomingProgress from './IncomingProgress';
import IncomingResponse from './IncomingResponse';

export default function Incoming() {
    const { height } = useRwd();
    const incoming = useIncoming();
    const { shippingEntity, shippingForm, items, attachments, setAttachments, shippingExpanded, setShippingExpanded, validation, saving, result, handleSubmit } = incoming;
    const shippingValidation = validation.sections.find(section => section.id === 'shipping');
    const finished = result?.ok === true;
    const contentHeight = Math.max(280, height - (shippingExpanded ? 560 : 320));

    return (
        <Box sx={{ height: Math.max(550, height - 116), display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 2, gap: 2 }}>

            {/* GŁÓWNA BELKA */}
            <Paper variant="outlined" sx={{ px: 2, py: 1, flexShrink: 0 }} onClick={() => setShippingExpanded(prev => !prev)}>
                <Stack direction="row" alignItems="center" spacing={3}>
                    <IconButton size="small">
                        {shippingExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                    <Box sx={{ flexShrink: 0 }}>
                        <Typography variant="h6">Przyjęcie przesyłki</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Przesyłka, zawartość i dokumenty
                        </Typography>
                    </Box>

                    {!finished && (
                        <IncomingProgress validation={validation} items={items} attachments={attachments} />
                    )}

                    <Box sx={{ flex: 1 }} />

                    {!finished && (
                        <Button
                            variant="contained"
                            startIcon={saving
                                ? <CircularProgress size={16} color="inherit" />
                                : <SaveOutlined />
                            }
                            onClick={handleSubmit}
                            disabled={saving || !validation.valid}
                        >
                            Zapisz przyjęcie
                        </Button>
                    )}
                    
                </Stack>
            </Paper>

            {finished ? (
                <IncomingResponse
                    result={result}
                    onReset={() => window.location.reload()}
                />
            ) : (
                <>
                    {/* PRZESYŁKA + DOKUMENTY */}
                    <Paper variant="outlined" sx={{ flexShrink: 0, overflow: 'hidden' }}>
                        <Collapse in={shippingExpanded}>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        lg: 'minmax(0, 2fr) minmax(0, 1fr)',
                                    },
                                    gap: 2,
                                    p: 1,
                                    alignItems: 'start',
                                }}
                            >
                                <Shipping form={shippingForm} />

                                <Box sx={{ p: 2, minWidth: 0 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Dokumenty
                                    </Typography>

                                    <IncomingFiles
                                        data={attachments}
                                        onChange={setAttachments}
                                        options={shippingEntity.schema?.options?.documents || []}
                                    />
                                </Box>
                            </Box>
                        </Collapse>
                    </Paper>

                    {/* ZAWARTOŚĆ — CAŁA SZEROKOŚĆ */}
                    <Box sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
                        <IncomingContent
                            incoming={incoming}
                            height={contentHeight}
                        />
                    </Box>

                    {/* BŁĘDY ZAPISU */}
                    {result && !result.ok && (
                        <IncomingResponse result={result} />
                    )}
                </>
            )}
        </Box>
    );
}
