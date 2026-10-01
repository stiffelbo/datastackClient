import React from 'react';

import {
    Box,
    IconButton,
    Tooltip,
} from '@mui/material';

import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';


const CommentsControls = ({
    onAddComment,
    onAddFile,

    canAddComment = true,
    canAddFile = true,

    disabled = false,
}) => {

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,

                p: 0.5,

                pointerEvents: 'auto',
            }}
        >
            {canAddComment && (
                <Tooltip title="Dodaj komentarz">
                    <span>
                        <IconButton
                            size="small"
                            color="primary"
                            disabled={disabled}
                            onClick={onAddComment}
                            aria-label="Dodaj komentarz"
                        >
                            <AddCommentOutlinedIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            )}

            {canAddFile && (
                <Tooltip title="Dodaj plik">
                    <span>
                        <IconButton
                            size="small"
                            color="primary"
                            disabled={disabled}
                            onClick={onAddFile}
                            aria-label="Dodaj plik"
                        >
                            <UploadFileOutlinedIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            )}
        </Box>
    );
};

export default CommentsControls;