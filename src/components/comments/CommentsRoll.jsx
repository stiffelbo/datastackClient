import React, { useEffect } from 'react';

import {
    Box,
    CircularProgress,
    Stack,
    Typography,
    Dialog, DialogContent, DialogTitle, IconButton
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import useCommentsLayout from './useCommentsLayout';

import useCommentsFilters from './useCommentsFilters';

import CommentsActivity from './activity/CommentsActivity';
import FileEditor from './editors/FileEditor';
import CommentEditor from './editors/CommentEditor';
import CommentsControls from './controls/CommentsControls';
import CommentsFilters from './controls/CommentsFilters';

const CommentsRoll = ({
    entityName = 'ProductComments',
    data = [],
    loading = false,

    mentionOptions = [],
    filesOptions = [],
    filesStatusesOptions = [],
    actions,

    ...activityProps
}) => {

    const layout = useCommentsLayout();
    const commentsFilters = useCommentsFilters(data);
    const handleChange = (data) => {
        console.log(data);
    }
    const handleImageUpload = (data) => {
        console.log(data);
    }
    const handleImageDelete = (data) => {
        console.log(data);
    }

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: 0,

                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',

                    // żeby floating controls nie przykrywały
                    // ostatniego elementu rolki
                    pb: 2,
                }}
            >
                <CommentsFilters
                    filters={commentsFilters.filters}
                    onChange={commentsFilters.updateFilters}
                />
                <CommentsActivity
                    data={commentsFilters.data}
                    loading={loading}
                    layout={layout}
                    actions={actions}
                    mentionOptions={mentionOptions}
                    filesStatusesOptions={filesStatusesOptions}
                />
            </Box>


            {layout.isCommentEditor && (

                <CommentEditor
                    mode="create"
                    value={null}
                    loading={false}
                    mentionOptions={mentionOptions}
                    onSubmit={data => {
                        actions.comments.create(data);
                        layout.closeEditor();
                    }}
                    onCancel={layout.closeEditor}
                    onChange={handleChange}
                    onImageUpload={handleImageUpload}
                    onImageDelete={handleImageDelete}
                />

            )}

            {layout.isFileEditor && (
                <FileEditor
                    onSubmit={data => {
                        actions.files.create(data);
                        layout.closeEditor();
                    }}
                    onCancel={layout.closeEditor}
                    filesOptions={filesOptions}
                />
            )}

            {!layout.isEditorOpen && (
                <Box
                    sx={{
                        position: 'sticky',
                        bottom: 12,
                        zIndex: 10,

                        display: 'flex',
                        justifyContent: 'flex-end',

                        height: 0,
                        overflow: 'visible',

                        pr: 1.5,
                        pointerEvents: 'none',
                    }}
                    id="stickyControlsBox"
                >
                    <CommentsControls
                        onAddComment={layout.showCommentEditor}
                        onAddFile={layout.showFileEditor}
                    />
                </Box>
            )}
        </Box>
    );
};

export default CommentsRoll;