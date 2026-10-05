import React from 'react';

import {
    FormControl,
    MenuItem,
    Select,
    Tooltip,
} from '@mui/material';

const FileStatusControl = ({
    file,
    statuses = [],
    onChange,
    loading = false,
}) => {
    const status = file.status;
    const canChange = file.rls?.can_change_status === true;

    const title = status
        ? [
            status.name,
            status.changed_by_name && `przez ${status.changed_by_name}`,
            status.changed_at && `dnia ${status.changed_at}`,
        ].filter(Boolean).join(' ')
        : 'Brak statusu';

    const handleChange = (event) => {
        onChange?.(file, event.target.value);
    };

    return (
        <Tooltip title={title}>
            <FormControl size="small">
                <Select
                    value={status?.id ?? ''}
                    onChange={handleChange}
                    disabled={!canChange || loading}
                    displayEmpty
                    sx={{
                        minWidth: 120,
                        height: 26,
                        fontSize: '0.75rem',

                        '& .MuiSelect-select': {
                            py: 0.25,
                            px: 1,
                        },

                        '& .MuiSvgIcon-root': {
                            fontSize: 16,
                        },
                    }}
                >
                    <MenuItem value="">
                        Brak statusu
                    </MenuItem>

                    {statuses.map(option => (
                        <MenuItem
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Tooltip>
    );
};

export default FileStatusControl;