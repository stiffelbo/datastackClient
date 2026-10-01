import React from 'react';

import {
    Box,
    Chip,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';

import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';

import FilePreview from './FilePreview';
import CommentItem from './CommentItem';
import PinControl from '../controls/PinControl';
import CommentEditor from '../editors/CommentEditor';


const FileItem = ({
    file,
    onPin,
    onCreateFileComment,
    mentionOptions = [],
    layout,
    ...props
}) => {

    const comments = file.comments ?? [];

    const isCommentEditorOpen =
        layout?.isFileCommentEditor &&
        layout?.target?.id === file.id;


        
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                borderRadius: 1,

                ...(file.is_pinned && {
                    bgcolor: '#fffbea',
                    borderColor: '#f0d879',
                }),
            }}
        >
            <Stack spacing={1.5}>
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
                            {file.authorName || 'Użytkownik'}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {file.created_at}
                        </Typography>

                        {file.file_type && (
                            <Chip
                                size="small"
                                variant="outlined"
                                label={file.file_type}
                            />
                        )}

                        {file.status?.name && (
                            <Chip
                                size="small"
                                label={file.status.name}
                            />
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
                        {file.rls?.can_reply && (
                            <Tooltip title="Dodaj komentarz">
                                <IconButton
                                    size="small"
                                    onClick={() => layout.showFileCommentEditor(file)}
                                >
                                    <AddCommentOutlinedIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                        )}

                        <PinControl
                            pinned={file.is_pinned}
                            canPin={file.rls?.can_pin}
                            canUnpin={file.rls?.can_unpin}
                            onChange={(pinned) => onPin?.(file, pinned)}
                        />
                    </Box>
                </Box>

                <FilePreview
                    file={file}
                    {...props}
                />

                {comments.length > 0 && (
                    <Stack
                        spacing={1}
                        sx={{
                            ml: {
                                xs: 1,
                                md: 4,
                            },
                        }}
                    >
                        {comments.map(comment => (
                            <CommentItem
                                key={`file_comment:${comment.id}`}
                                comment={comment}
                                layout={layout}
                                {...props}
                            />
                        ))}
                    </Stack>
                )}

                {isCommentEditorOpen && (
                    <Box
                        sx={{
                            ml: {
                                xs: 1,
                                md: 4,
                            },
                        }}
                    >
                        <CommentEditor
                            value={null}
                            mentionOptions={mentionOptions}

                            onSubmit={async (data) => {
                                await onCreateFileComment?.(file, data);
                                layout.closeEditor();
                            }}

                            onCancel={layout.closeEditor}
                        />
                    </Box>
                )}

            </Stack>
        </Paper>
    );
};

export default FileItem;