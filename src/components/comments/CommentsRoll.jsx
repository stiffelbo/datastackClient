import React, {useEffect} from 'react';

import {
    Box,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';

import useCommentsLayout from './useCommentsLayout';

import CommentsActivity from './activity/CommentsActivity';
import FileEditor from './editors/FileEditor';
import CommentEditor from './editors/CommentEditor';
import CommentsControls from './controls/CommentsControls';

const CommentsRoll = ({
    data = [],
    loading = false,

    mentionOptions = [],
    filesOptions = [],

    onCreateComment,
    onCreateFile,
    onCreateFileComment,
    onPinn,

    ...activityProps
}) => {

    const layout = useCommentsLayout();
    const handleChange = (data)=>{
        console.log(data);
    }
    const handleImageUpload = (data)=>{
        console.log(data);
    }
    const handleImageDelete = (data)=>{
        console.log(data);
    }



    return (
        <Box
            sx={{
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
                    pb: 7,
                }}
            >
                <CommentsActivity
                    data={data}
                    loading={loading}
                    layout={layout}
                    onCreateFileComment={onCreateFileComment}
                    onPinn={onPinn}
                />
            </Box>

            {layout.isCommentEditor && (
                <CommentEditor
                    value={null}
                    loading={false}
                    mentionOptions={mentionOptions}
                    onSubmit={data => {
                        onCreateComment(data);
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
                        onCreateFile(data);
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