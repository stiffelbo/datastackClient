import React, { useEffect, useMemo, useState } from 'react';

import {
    Box,
    IconButton,
    Popover,
    Stack,
    TextField,
    Tooltip,
    Button,
    CircularProgress,
} from '@mui/material';

import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ChatIcon from '@mui/icons-material/Chat';

import useEntity from '../../hooks/useEntity';

const BoardControl = ({
    reference,
    refId,
    tab = null,
}) => {
    const entity = useEntity({
        endpoint: 'board',
        entityName: 'Board',
        reload: false,
        cacheHardKey : 'Board'
    });

    const [anchorEl, setAnchorEl] = useState(null);
    const [draft, setDraft] = useState('');
    const [saving, setSaving] = useState(false);

    const boardItem = useMemo(() => {
        return entity.rows.find(row =>
            row.reference === reference &&
            Number(row.reference_id) === Number(refId) &&
            (row.tab ?? null) === tab &&
            row.type === 'favorite' &&
            Number(row.is_active) === 1
        ) ?? null;
    }, [entity.rows, reference, refId, tab]);

    const isOnBoard = Boolean(boardItem);
    const priority = Boolean(Number(boardItem?.priority));
    const comments = boardItem?.comments ?? '';

    useEffect(() => {
        if (!anchorEl) setDraft(comments);
    }, [comments, anchorEl]);

    const handleToggleBoard = async () => {
        if (saving || !reference || !refId) return;

        setSaving(true);

        try {
            if (boardItem) {
                await entity.updateField({ id: boardItem.id, field: 'is_active', value: 0 });
            } else {
                await entity.create({
                    reference: reference,
                    reference_id: Number(refId),
                    tab,
                    type: 'favorite',
                    priority: 0,
                    is_active: 1,
                });
            }

            await entity.refresh();
        } catch (err) {
            console.error('Board toggle error', err);
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePriority = async () => {
        if (!boardItem || saving) return;

        setSaving(true);

        try {
            await entity.updateField({
                id: boardItem.id,
                field: 'priority',
                value: priority ? 0 : 1
            });

            await entity.refresh();
        } catch (err) {
            console.error('Board priority error', err);
        } finally {
            setSaving(false);
        }
    };

    const handleOpenNote = (event) => {
        setDraft(comments);
        setAnchorEl(event.currentTarget);
    };

    const handleCloseNote = () => {
        setAnchorEl(null);
    };

    const handleSaveNote = async () => {
        if (!boardItem || saving) return;

        setSaving(true);

        try {
            await entity.updateField({
                id: boardItem.id,
                field: 'comments',
                value: draft.trim() || null
            });

            await entity.refresh();
            setAnchorEl(null);
        } catch (err) {
            console.error('Board comments error', err);
        } finally {
            setSaving(false);
        }
    };

    const disabled = saving || entity.loading;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <Tooltip title={isOnBoard ? 'Usuń z tablicy' : 'Dodaj do tablicy'}>
                <span>
                    <IconButton
                        size="small"
                        disabled={disabled}
                        onClick={handleToggleBoard}
                    >
                        {saving
                            ? <CircularProgress size={16} />
                            : isOnBoard
                                ? <StarIcon fontSize="small" color="warning" />
                                : <StarBorderIcon fontSize="small" />
                        }
                    </IconButton>
                </span>
            </Tooltip>

            {isOnBoard && (
                <>
                    <Tooltip title="Priorytet">
                        <span>
                            <IconButton
                                size="small"
                                disabled={disabled}
                                onClick={handleTogglePriority}
                            >
                                <PriorityHighIcon
                                    fontSize="small"
                                    color={priority ? 'error' : 'disabled'}
                                />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title="Notatka">
                        <span>
                            <IconButton
                                size="small"
                                disabled={disabled}
                                onClick={handleOpenNote}
                            >
                                {comments
                                    ? <ChatIcon fontSize="small" color="warning" />
                                    : <ChatBubbleOutlineIcon fontSize="small" />
                                }
                            </IconButton>
                        </span>
                    </Tooltip>
                </>
            )}

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleCloseNote}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Stack spacing={1} sx={{ p: 1.5, width: 320 }}>
                    <TextField
                        label="Notatka"
                        size="small"
                        multiline
                        minRows={3}
                        maxRows={6}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        fullWidth
                    />

                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button
                            size="small"
                            disabled={saving}
                            onClick={handleCloseNote}
                        >
                            Anuluj
                        </Button>

                        <Button
                            size="small"
                            variant="contained"
                            disabled={saving}
                            onClick={handleSaveNote}
                        >
                            Zapisz
                        </Button>
                    </Stack>
                </Stack>
            </Popover>
        </Box>
    );
};

export default BoardControl;