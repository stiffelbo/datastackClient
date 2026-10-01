import React from 'react';

import {
    CircularProgress,
    IconButton,
    Tooltip,
} from '@mui/material';

import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import PushPinIcon from '@mui/icons-material/PushPin';


const PinControl = ({
    pinned = false,

    canPin = false,
    canUnpin = false,

    onChange,

    disabled = false,
    loading = false,

    size = 'small',
}) => {

    const canChange = pinned
        ? canUnpin
        : canPin;

    const isDisabled =
        disabled ||
        loading ||
        !canChange ||
        typeof onChange !== 'function';

    const label = pinned
        ? 'Odepnij'
        : 'Przypnij';

    const color = pinned
        ? 'warning'
        : 'default';

    const handleClick = (event) => {
        event.stopPropagation();

        if (isDisabled) {
            return;
        }

        onChange(!pinned);
    };

    return (
        <Tooltip title={isDisabled ? '' : label}>
            <span>
                <IconButton
                    size={size}
                    disabled={isDisabled}
                    onClick={handleClick}
                    aria-label={label}
                    color={color}
                >
                    {loading ? (
                        <CircularProgress
                            size={16}
                            thickness={5}
                        />
                    ) : pinned ? (
                        <PushPinIcon fontSize="inherit" />
                    ) : (
                        <PushPinOutlinedIcon fontSize="inherit" />
                    )}
                </IconButton>
            </span>
        </Tooltip>
    );
};

export default PinControl;