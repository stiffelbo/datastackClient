import React from 'react';
import { Box, Button, CircularProgress, Collapse, IconButton, Paper, Stack, Typography } from '@mui/material';
import { SaveOutlined, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useRwd } from '../../context/RwdContext';
import useOutgoing from './useOutgoing';
import Shipping from './Shipping';
import OutgoingFiles from './OutgoingFiles';
import OutgoingContent from './OutgoingContent';
import OutgoingProgress from './OutgoingProgress';
import OutgoingResponse from './OutgoingResponse';

export default function Outgoing() {
    const { height } = useRwd();
    const outgoing = useOutgoing();
    const { shippingEntity, shippingForm, items, attachments, setAttachments, shippingExpanded, setShippingExpanded, validation, saving, result, handleSubmit } = outgoing;
    const finished = result?.ok === true;
    const contentHeight = Math.max(280, height - (shippingExpanded ? 560 : 320));
    return <Box sx={{ height: Math.max(550, height - 116), display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 2, gap: 2 }}>
        <Paper variant="outlined" sx={{ px: 2, py: 1, flexShrink: 0 }}>
            <Stack direction="row" alignItems="center" spacing={3}>
                <IconButton size="small" onClick={() => setShippingExpanded(prev => !prev)} disabled={finished}>{shippingExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton>
                <Box sx={{ flexShrink: 0 }}><Typography variant="h6">Odesłanie elementów</Typography><Typography variant="caption" color="text.secondary">Przesyłka, WZ, zawartość i dokumenty</Typography></Box>
                {!finished && <OutgoingProgress validation={validation} items={items} attachments={attachments} />}
                <Box sx={{ flex: 1 }} />
                {!finished && <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlined />} onClick={handleSubmit} disabled={saving || !validation.valid}>Zapisz odesłanie</Button>}
            </Stack>
        </Paper>
        {finished ? <OutgoingResponse result={result} onReset={() => window.location.reload()} /> : <>
            <Paper variant="outlined" sx={{ flexShrink: 0, overflow: 'hidden' }}>
                <Collapse in={shippingExpanded}><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,2fr) minmax(0,1fr)' }, gap: 2, p: 1, alignItems: 'start' }}>
                    <Shipping form={shippingForm} />
                    <Box sx={{ p: 2, minWidth: 0 }}><Typography variant="subtitle2" sx={{ mb: 1 }}>Dokumenty</Typography><OutgoingFiles data={attachments} onChange={setAttachments} options={shippingEntity.schema?.options?.documents || []} /></Box>
                </Box></Collapse>
            </Paper>
            <Box sx={{ flex: 1, minHeight: 0, minWidth: 0 }}><OutgoingContent outgoing={outgoing} height={contentHeight} /></Box>
            {result && !result.ok && <OutgoingResponse result={result} />}
        </>}
    </Box>;
}
