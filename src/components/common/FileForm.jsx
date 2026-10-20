import React, { useState, useRef, useEffect } from 'react';

import {
    Box,
    Button,
    Typography,
    IconButton,
    CircularProgress,
    Alert,
    Paper,
    Stack,
} from '@mui/material';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const FileForm = ({
    name,
    label = 'Plik',
    url = null,
    showFile = true,
    accept = '*/*',
    disabled = false,
    compact = false,
    onSubmit,
}) => {
    const inputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

    const resetSelection = () => {
        setSelectedFile(null);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleChange = (event) => {
        const file = event.target.files?.[0] ?? null;

        if (!file) return;

        setSelectedFile(file);
        setError(null);
    };

    const handleSave = async () => {
        if (!selectedFile || !onSubmit) return;

        setLoading(true);
        setError(null);

        try {
            // Przekazujemy prawdziwy obiekt File.
            await onSubmit(selectedFile);

            resetSelection();
        } catch (err) {
            setError(err?.message || 'Nie udało się zapisać pliku.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!onSubmit || !url) return;

        setLoading(true);
        setError(null);

        try {
            // null oznacza usunięcie pliku.
            await onSubmit(null);

            resetSelection();
        } catch (err) {
            setError(err?.message || 'Nie udało się usunąć pliku.');
        } finally {
            setLoading(false);
        }
    };

    const displayUrl = previewUrl || url;

    const isImage = selectedFile
        ? selectedFile.type.startsWith('image/')
        : accept.includes('image/') ||
        /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url || '');


    if (compact) {
        return (
            <Box>
                <Box
                    sx={{
                        position: 'relative',
                        height: 210,
                        bgcolor: 'action.hover',
                        borderRadius: 2,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {showFile && displayUrl && isImage ? (
                        <Box
                            component="img"
                            src={displayUrl}
                            alt={label}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                p: 1,
                            }}
                        />
                    ) : showFile && displayUrl ? (
                        <Button
                            component="a"
                            href={displayUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<InsertDriveFileIcon />}
                        >
                            Otwórz plik
                        </Button>
                    ) : (
                        <Stack
                            spacing={1}
                            alignItems="center"
                            color="text.disabled"
                        >
                            <InsertDriveFileIcon sx={{ fontSize: 38 }} />
                            <Typography variant="caption">
                                Brak fotografii
                            </Typography>
                        </Stack>
                    )}

                    {loading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: 'rgba(0,0,0,0.25)',
                                display: 'grid',
                                placeItems: 'center',
                            }}
                        >
                            <CircularProgress size={28} />
                        </Box>
                    )}
                </Box>

                {selectedFile && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        title={selectedFile.name}
                        sx={{ display: 'block', mt: 1 }}
                    >
                        {selectedFile.name}
                    </Typography>
                )}

                {!disabled && (
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mt: 1.5 }}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            name={name}
                            accept={accept}
                            disabled={loading}
                            hidden
                            onChange={handleChange}
                        />

                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<UploadFileIcon />}
                            disabled={loading}
                            onClick={() => inputRef.current?.click()}
                            sx={{ textTransform: 'none' }}
                        >
                            {url ? 'Zmień' : 'Dodaj zdjęcie'}
                        </Button>

                        {selectedFile && (
                            <>
                                <Button
                                    size="small"
                                    variant="contained"
                                    disabled={loading}
                                    onClick={handleSave}
                                    startIcon={<SaveIcon />}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Zapisz
                                </Button>

                                <IconButton
                                    size="small"
                                    disabled={loading}
                                    onClick={resetSelection}
                                    title="Anuluj"
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </>
                        )}

                        {url && !selectedFile && (
                            <IconButton
                                size="small"
                                color="error"
                                disabled={loading}
                                onClick={handleDelete}
                                title="Usuń zdjęcie"
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Stack>
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                        {error}
                    </Alert>
                )}
            </Box>
        );
    }


    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={2}>
                <Typography variant="subtitle2">
                    {label}
                </Typography>

                {showFile && displayUrl && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: 'action.hover',
                            borderRadius: 1,
                            minHeight: 120,
                            overflow: 'hidden',
                        }}
                    >
                        {isImage ? (
                            <Box
                                component="img"
                                src={displayUrl}
                                alt={label}
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: 260,
                                    objectFit: 'contain',
                                }}
                            />
                        ) : (
                            <Button
                                component="a"
                                href={displayUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<InsertDriveFileIcon />}
                            >
                                Otwórz plik
                            </Button>
                        )}
                    </Box>
                )}

                {selectedFile && (
                    <Typography variant="body2" color="text.secondary">
                        {selectedFile.name}
                        {' — '}
                        {(selectedFile.size / 1024).toFixed(1)} KB
                    </Typography>
                )}

                {!selectedFile && !url && (
                    <Typography variant="body2" color="text.secondary">
                        Brak pliku
                    </Typography>
                )}

                {!disabled && <Stack direction="row" spacing={1} flexWrap="wrap">
                    <input
                        ref={inputRef}
                        type="file"
                        name={name}
                        accept={accept}
                        disabled={disabled || loading}
                        style={{ display: 'none' }}
                        onChange={handleChange}
                    />
                    <Button
                        variant="outlined"
                        size="small"
                        disabled={disabled || loading}
                        startIcon={<UploadFileIcon />}
                        onClick={() => inputRef.current?.click()}
                    >
                        {url ? 'Zmień plik' : 'Wybierz plik'}
                    </Button>

                    {selectedFile && (
                        <>
                            <Button
                                variant="contained"
                                size="small"
                                disabled={disabled || loading}
                                startIcon={
                                    loading
                                        ? <CircularProgress size={16} color="inherit" />
                                        : <SaveIcon />
                                }
                                onClick={handleSave}
                            >
                                Zapisz
                            </Button>

                            <IconButton
                                size="small"
                                disabled={disabled || loading}
                                onClick={resetSelection}
                                title="Anuluj wybór"
                            >
                                <CloseIcon />
                            </IconButton>
                        </>
                    )}

                    {url && !selectedFile && (
                        <IconButton
                            size="small"
                            color="error"
                            disabled={disabled || loading}
                            onClick={handleDelete}
                            title="Usuń plik"
                        >
                            <DeleteOutlineIcon />
                        </IconButton>
                    )}
                </Stack>}

                {error && <Alert severity="error">{error}</Alert>}
            </Stack>
        </Paper>
    );
};

export default FileForm;
