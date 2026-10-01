import React, { useState } from 'react';

import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from '@mui/material';


const FileEditor = ({
    loading = false,
    filesOptions = [],
    onSubmit,
    onCancel,
}) => {

    const [file, setFile] = useState(null);
    const [type, setType] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files?.[0] ?? null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!file || !type || loading) {
            return;
        }

        onSubmit?.({
            file,
            type,
        });
    };

    const canSubmit =
        !!file &&
        !!type &&
        !loading;

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                width: '100%',
                py: 1,
            }}
        >
            <Stack spacing={2}>
                <Typography variant="subtitle2">
                    Dodaj plik
                </Typography>

                <Button
                    component="label"
                    variant="outlined"
                    disabled={loading}
                >
                    {file?.name || 'Wybierz plik'}

                    <input
                        hidden
                        type="file"
                        onChange={handleFileChange}
                    />
                </Button>

                <FormControl
                    size="small"
                    fullWidth
                    disabled={loading}
                >
                    <InputLabel id="file-type-label">
                        Typ pliku
                    </InputLabel>

                    <Select
                        labelId="file-type-label"
                        value={type}
                        label="Typ pliku"
                        onChange={(e) => setType(e.target.value)}
                    >
                        {filesOptions.map(option => (
                            <MenuItem
                                key={option}
                                value={option}
                            >
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button
                        type="button"
                        variant="outlined"
                        disabled={loading}
                        onClick={onCancel}
                    >
                        Anuluj
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={!canSubmit}
                    >
                        {loading
                            ? 'Zapisywanie...'
                            : 'Zapisz plik'
                        }
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
};

export default FileEditor;