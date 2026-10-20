
import React from 'react';

import {
    Box,
    Button,
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
    const buttonSx = {
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 2,
        px: 2,
        py: 0.8,
        whiteSpace: 'nowrap',
        boxShadow: 3,
        transition: 'all 0.2s ease',
        '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)',
        },
        '&:disabled': {
            boxShadow: 'none',
            transform: 'none',
        },
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 0.5,
                pointerEvents: 'auto',
            }}
        >
            {canAddComment && (
                <Tooltip title="Dodaj komentarz">
                    <span>
                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<AddCommentOutlinedIcon />}
                            disabled={disabled}
                            onClick={onAddComment}
                            sx={buttonSx}
                        >
                            Dodaj komentarz
                        </Button>
                    </span>
                </Tooltip>
            )}

            {canAddFile && (
                <Tooltip title="Dodaj plik">
                    <span>
                        <Button
                            variant="contained"
                            size="small"
                            color="success"
                            startIcon={<UploadFileOutlinedIcon />}
                            disabled={disabled}
                            onClick={onAddFile}
                            sx={buttonSx}
                        >
                            Dodaj plik
                        </Button>
                    </span>
                </Tooltip>
            )}
        </Box>
    );
};

export default CommentsControls;
