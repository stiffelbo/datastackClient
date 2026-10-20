
import React from 'react';

import {
    Box,
    Stack,
    Typography,
    IconButton,
    FormControl,
    Select,
    MenuItem,
    Divider,
} from '@mui/material';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

import FileDropZone from '../../../components/common/FileDropZone';

const IncomingFiles = ({ data = [], onChange, options = [] }) => {

    const onRemoveFile = (id) => {
        onChange(data.filter(item => item.id !== id));
    };

    const handleEdit = (id, field, value) => {
        onChange(
            data.map(item =>
                item.id === id
                    ? { ...item, [field]: value }
                    : item
            )
        );
    };

    const renderFile = (item) => (
        <Box key={item.id}>
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ py: 1, px: 0.5 }}
            >
                <InsertDriveFileOutlinedIcon
                    fontSize="small"
                    color="action"
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="body2"
                        title={item.file?.name}
                        noWrap
                    >
                        {item.file?.name || item.title}
                    </Typography>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        {item.file?.size != null
                            ? `${(item.file.size / 1024).toFixed(1)} KB`
                            : ''}
                    </Typography>
                </Box>

                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select
                        value={item.type ?? ''}
                        displayEmpty
                        onChange={(e) =>
                            handleEdit(item.id, 'type', e.target.value)
                        }
                        sx={{ fontSize: 13 }}
                    >
                        <MenuItem value="">
                            <em>Wybierz typ</em>
                        </MenuItem>

                        {options.map(option => (
                            <MenuItem
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <IconButton
                    size="small"
                    color="error"
                    title="Usuń plik"
                    onClick={() => onRemoveFile(item.id)}
                >
                    <DeleteForeverIcon fontSize="small" />
                </IconButton>
            </Stack>

            <Divider />
        </Box>
    );

    return (
        <Box sx={{ width: '100%', maxWidth: '100%' }}>
            <FileDropZone
                value={data}
                onChange={onChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple
            />

            {data.length > 0 && (
                <Box
                    sx={{
                        mt: 1,
                        maxHeight: 250,
                        overflowY: 'auto',
                    }}
                >
                    {data.map(renderFile)}
                </Box>
            )}
        </Box>
    );
};

export default IncomingFiles;
