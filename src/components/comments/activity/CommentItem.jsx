import React from 'react';

import {
    Box,
    Paper,
    Stack,
    Typography,
} from '@mui/material';

import PinControl from '../controls/PinControl';
import EditControl from '../controls/EditControl';
import DeleteControl from '../controls/DeleteControl';
import CommentEditor from '../editors/CommentEditor';

import {
    ACTIVITY_TYPES,
} from '../ActivityDto';


const CommentItem = ({
    comment,
    layout,
    actions,
    mentionOptions = [],
}) => {

    const isFileComment =
        comment.item_type === ACTIVITY_TYPES.FILE_COMMENT;

    const isEditing =
        layout?.isCommentEdit &&
        layout?.target?.id === comment.id &&
        layout?.target?.type === comment.type;

    const handleEdit = () => {
        layout?.showCommentEdit(comment);
    };

    const handleDelete = () => {
        if (isFileComment) {
            actions?.fileComments?.delete?.(comment);
            return;
        }

        actions?.comments?.delete?.(comment);
    };

    const handleUpdate = async (data) => {
        console.log(data, isFileComment);
        if (isFileComment) {
            console.log(data);
            await actions.fileComments.update(
                comment,
                data
            );
        } else {
            await actions?.comments?.update?.(
                comment,
                data
            );
        }

        layout?.closeEditor();
    };

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
                            gap: 0.25,
                        }}
                    >
                        <EditControl
                            canEdit={comment.rls?.can_edit}
                            onClick={handleEdit}
                        />

                        <DeleteControl
                            canDelete={comment.rls?.can_delete}
                            onClick={handleDelete}
                        />

                        {!isFileComment && actions?.comments?.pin && (
                            <PinControl
                                pinned={comment.is_pinned}
                                canPin={comment.rls?.can_pin}
                                canUnpin={comment.rls?.can_unpin}
                                onChange={(pinned) =>
                                    actions.comments.pin(
                                        comment,
                                        pinned
                                    )
                                }
                            />
                        )}
                    </Box>
                </Box>

                {isEditing ? (
                    <CommentEditor
                        mode="edit"
                        value={comment.content ?? ''}
                        mentionOptions={mentionOptions}
                        onSubmit={handleUpdate}
                        onCancel={layout?.closeEditor}
                    />
                ) : (
                    comment.content && (
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
                    )
                )}

            </Stack>
        </Paper>
    );
};

export default CommentItem;