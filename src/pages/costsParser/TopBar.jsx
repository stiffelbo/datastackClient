import React, { useRef } from 'react';

import {
    AppBar,
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Toolbar,
    Typography,
} from '@mui/material';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ClearIcon from '@mui/icons-material/Clear';

const TopBar = ({
    versions = [],
    selectedVersion,
    onVersionChange,
    files = [],
    onFilesChange,
    onParse,
    onClear,
    loading = false,
}) => {
    const inputRef = useRef(null);

    const handleFileInputChange = (event) => {
        const selectedFiles = Array.from(
            event.target.files ?? []
        );

        onFilesChange?.(selectedFiles);

        /*
         * Pozwala ponownie wybrać ten sam plik.
         */
        event.target.value = '';
    };

    return (
        <AppBar
            position="static"
            color="default"
            elevation={0}
            sx={{
                borderBottom: 1,
                borderColor: 'divider',
            }}
        >
            <Toolbar
                sx={{
                    gap: 2,
                    flexWrap: 'wrap',
                    py: 1,
                }}
            >
                <Box sx={{ minWidth: 220 }}>
                    <Typography variant="h6">
                        Parser kart kosztów
                    </Typography>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        XLSX
                    </Typography>
                </Box>

                <FormControl
                    size="small"
                    sx={{ minWidth: 240 }}
                >
                    <InputLabel id="cost-parser-version-label">
                        Wersja parsera
                    </InputLabel>

                    <Select
                        labelId="cost-parser-version-label"
                        value={selectedVersion}
                        label="Wersja parsera"
                        onChange={(event) =>
                            onVersionChange?.(event.target.value)
                        }
                    >
                        {versions.map((version) => (
                            <MenuItem
                                key={version.id}
                                value={version.id}
                            >
                                {version.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    hidden
                    accept=".ods,.xlsx,.xls"
                    onChange={handleFileInputChange}
                />

                <Button
                    variant="outlined"
                    startIcon={<UploadFileIcon />}
                    onClick={() => inputRef.current?.click()}
                    disabled={loading}
                >
                    Wybierz pliki
                </Button>

                <Button
                    variant="contained"
                    startIcon={
                        loading
                            ? (
                                <CircularProgress
                                    size={18}
                                    color="inherit"
                                />
                            )
                            : <PlayArrowIcon />
                    }
                    onClick={onParse}
                    disabled={loading || files.length === 0}
                >
                    {loading ? 'Parsowanie...' : 'Parsuj'}
                </Button>

                <Button
                    variant="text"
                    color="inherit"
                    startIcon={<ClearIcon />}
                    onClick={onClear}
                    disabled={loading || files.length === 0}
                >
                    Wyczyść
                </Button>

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        flex: 1,
                        minWidth: 200,
                        overflow: 'hidden',
                    }}
                >
                    <Chip
                        size="small"
                        label={`Pliki: ${files.length}`}
                        color={files.length ? 'primary' : 'default'}
                    />

                    {files.slice(0, 3).map((file) => (
                        <Chip
                            key={`${file.name}-${file.size}`}
                            size="small"
                            variant="outlined"
                            label={file.name}
                            sx={{
                                maxWidth: 220,
                            }}
                        />
                    ))}

                    {files.length > 3 && (
                        <Chip
                            size="small"
                            label={`+${files.length - 3}`}
                        />
                    )}
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export default TopBar;