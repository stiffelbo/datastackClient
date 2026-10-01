import React from 'react';

import {
    Box,
    Paper,
    Stack,
    Typography,
} from '@mui/material';

import PinControl from '../controls/PinControl';

const CommentItem = ({
    comment,
    layout,
    onPinn = null
}) => {

    console.log(onPinn)
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                borderRadius: 1,

                ...(comment.is_pinned && {
                    bgcolor: '#fffbea',
                    borderColor: '#f0d879',
                }),
            }}
        >
            <Stack spacing={1}>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        width: '100%',
                    }}
                >
                    {/* LEFT — metadata */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                            minWidth: 0,
                        }}
                    >
                        <Typography variant="subtitle2">
                            {comment.authorName || 'Użytkownik'}
                        </Typography>

                        {comment.created_at && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {comment.created_at}
                            </Typography>
                        )}
                    </Box>

                    {/* RIGHT — actions */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {onPinn && <PinControl
                            pinned={comment.is_pinned}
                            canPin={comment.rls?.can_pin}
                            canUnpin={comment.rls?.can_unpin}
                            onChange={(pinned) => onPinn?.(comment, pinned)}
                        />}
                    </Box>
                </Box>

                {comment.content && (
                    <Box
                        sx={{
                            fontSize: '0.875rem',

                            '& p': {
                                my: 0.5,
                            },

                            '& p:first-of-type': {
                                mt: 0,
                            },

                            '& p:last-of-type': {
                                mb: 0,
                            },

                            '& img': {
                                maxWidth: '100%',
                                height: 'auto',
                            },
                        }}
                        dangerouslySetInnerHTML={{
                            __html: comment.content,
                        }}
                    />
                )}

            </Stack>
        </Paper>
    );
};

export default CommentItem;