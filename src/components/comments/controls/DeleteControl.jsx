import React from 'react';

import {
    CircularProgress,
    IconButton,
    Tooltip,
} from '@mui/material';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';


const DeleteControl = ({
    canDelete = false,

    onClick,

    disabled = false,
    loading = false,

    size = 'small',
}) => {

    const isDisabled =
        disabled ||
        loading ||
        !canDelete ||
        typeof onClick !== 'function';

    const handleClick = (event) => {
        event.stopPropagation();

        if (isDisabled) {
            return;
        }

        onClick();
    };

    return (
        <Tooltip title={isDisabled ? '' : 'Usuń'}>
            <span>
                <IconButton
                    size={size}
                    disabled={isDisabled}
                    onClick={handleClick}
                    aria-label="Usuń"
                    color="error"
                >
                    {loading ? (
                        <CircularProgress
                            size={16}
                            thickness={5}
                        />
                    ) : (
                        <DeleteOutlineIcon fontSize="inherit" />
                    )}
                </IconButton>
            </span>
        </Tooltip>
    );
};

export default DeleteControl;