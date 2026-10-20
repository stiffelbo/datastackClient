
import React, { useState, useEffect, useRef, useCallback } from 'react';

import {
    Box,
    Button,
    Stack,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';

import http from '../../http';

const NumismaticsScanForm = ({
    id,
    name,
    side,
    canUpload = false,
}) => {
    const inputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [scanPath, setScanPath] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const loadScan = useCallback(async () => {
        if (!id || !side) {
            setScanPath(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await http.get(
                '/numismatics/scan.php',
                { params: { id, side } }
            );

            const result = response.data ?? response;

            setScanPath(result.path ?? null);
        } catch (err) {
            setError('Nie udało się sprawdzić skanu');
        } finally {
            setLoading(false);
        }
    }, [id, side]);

    useEffect(() => {
        setFile(null);
        loadScan();
    }, [id, loadScan]);

    const handleSave = async () => {
        if (!file || !id || !side || saving) return;

        const formData = new FormData();

        formData.append('id', String(id));
        formData.append('side', side);
        formData.append('file', file);

        setSaving(true);
        setError(null);

        try {
            const response = await http.post(
                '/numismatics/scan.php',
                formData
            );

            if (response?.success !== true) {
                throw new Error('Nie udało się zapisać skanu');
            }

            setFile(null);

            if (inputRef.current) {
                inputRef.current.value = '';
            }

            await loadScan();
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Błąd zapisu skanu'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = async () => {
        if (!scanPath) return;

        setError(null);

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(scanPath);
            } else {
                const textarea = document.createElement('textarea');

                textarea.value = scanPath;
                textarea.style.position = 'fixed';
                textarea.style.left = '-9999px';

                document.body.appendChild(textarea);

                textarea.focus();
                textarea.select();

                const copied = document.execCommand('copy');

                document.body.removeChild(textarea);

                if (!copied) {
                    throw new Error('Kopiowanie nie powiodło się');
                }
            }
        } catch (err) {
            setError('Nie udało się skopiować ścieżki');
        }
    };


    return (
        <Box>
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                    minHeight: 36,
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                }}
            >
                {loading ? (
                    <CircularProgress size={18} />
                ) : scanPath ? (
                    <Button
                        size="small"
                        variant="text"
                        color="inherit"
                        onClick={handleCopy}
                        startIcon={<CenterFocusStrongIcon fontSize="small" />}
                        sx={{ whiteSpace: 'nowrap', textTransform: 'none' }}
                    >
                        Skan {side}
                    </Button>
                ) : (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        Brak skanu {side}
                    </Typography>
                )}

                {canUpload && (
                    <>
                        <input
                            ref={inputRef}
                            type="file"
                            hidden
                            disabled={saving}
                            onChange={event => {
                                setFile(event.target.files?.[0] ?? null);
                                setError(null);
                            }}
                        />

                        <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            disabled={saving}
                            startIcon={<UploadFileIcon fontSize="small" />}
                            onClick={() => inputRef.current?.click()}
                            sx={{
                                whiteSpace: 'nowrap',
                                textTransform: 'none',
                                minWidth: 'auto',
                            }}
                        >
                            Wybierz
                        </Button>

                        {file && (
                            <>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    title={file.name}
                                    sx={{ maxWidth: 140 }}
                                >
                                    {file.name}
                                </Typography>

                                <Button
                                    size="small"
                                    variant="contained"
                                    disabled={saving}
                                    onClick={handleSave}
                                    startIcon={
                                        saving
                                            ? <CircularProgress size={14} color="inherit" />
                                            : <UploadFileIcon fontSize="small" />
                                    }
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        textTransform: 'none',
                                        minWidth: 'auto',
                                    }}
                                >
                                    {scanPath ? 'Podmień' : 'Zapisz'}
                                </Button>
                            </>
                        )}
                    </>
                )}
            </Stack>

            {error && (
                <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: 'block', mt: 0.5 }}
                >
                    {error}
                </Typography>
            )}
        </Box>
    );

};

export default NumismaticsScanForm;
