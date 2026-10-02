import React from 'react';

import {
    CircularProgress,
    IconButton,
    Tooltip,
} from '@mui/material';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';


const EditControl = ({
    canEdit = false,

    onClick,

    disabled = false,
    loading = false,

    size = 'small',
}) => {

    const isDisabled =
        disabled ||
        loading ||
        !canEdit ||
        typeof onClick !== 'function';

    const handleClick = (event) => {
        event.stopPropagation();

        if (isDisabled) {
            return;
        }

        onClick();
    };

    return (
        <Tooltip title={isDisabled ? '' : 'Edytuj'}>
            <span>
                <IconButton
                    size={size}
                    disabled={isDisabled}
                    onClick={handleClick}
                    aria-label="Edytuj"
                >
                    {loading ? (
                        <CircularProgress
                            size={16}
                            thickness={5}
                        />
                    ) : (
                        <EditOutlinedIcon fontSize="inherit" />
                    )}
                </IconButton>
            </span>
        </Tooltip>
    );
};

export default EditControl;