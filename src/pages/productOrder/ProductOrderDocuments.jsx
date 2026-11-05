import React, { useMemo, useState } from 'react';

import {
    Box,
    Stack,
    Typography,
    Button,
    Alert,
    LinearProgress,
    IconButton,
    Tooltip,
} from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import useEntity from '../../hooks/useEntity';
import PowerTable from '../../components/powerTable/powerTable';

const entityName = 'ProductOrderDocuments';
const endpoint = '/wh_documents/';

const getStorageUrl = () => import.meta.env.DEV
    ? import.meta.env.VITE_DEV_STORAGE_URL
    : import.meta.env.VITE_PROD_STORAGE_URL;

const getFileUrl = (path) => {
    const baseUrl = getStorageUrl();

    if (!baseUrl || !path) return null;

    return `${baseUrl.replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;
};

const DownloadLink = ({ value }) => {
    const url = getFileUrl(value);

    if (!url) return null;

    return (
        <Tooltip title="Pobierz dokument">
            <IconButton
                component="a"
                href={url}
                download
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                color="primary"
            >
                <DownloadIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
};

const ProductOrderDocuments = ({ id, row, entity, rwd, dashboard }) => {
    const [downloading, setDownloading] = useState(false);

    const documentsEntity = useEntity({
        endpoint,
        entityName,
        query: { product_order_id: id },
    });

    const documents = documentsEntity.data ?? [];

    const columns = useMemo(() => {
        return (documentsEntity.schema?.columns ?? []).map(column => {
            if (column.field === 'file_path') {
                return {
                    ...column,
                    renderCell: params => <DownloadLink value={params.value} />,
                };
            }

            return column;
        });
    }, [documentsEntity.schema?.columns]);

    const downloadZip = async () => {
        if (downloading || !documents.length) return;

        setDownloading(true);

        try {
            const response = await fetch(
                `/wh_documents/download_zip.php?product_order_id=${encodeURIComponent(id)}`,
                { credentials: 'include' }
            );

            if (!response.ok) {
                throw new Error('Nie udało się pobrać archiwum ZIP.');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `zamowienie_${id}_dokumenty.zip`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            window.alert(error.message);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <Stack spacing={1.5} sx={{ p: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <DescriptionOutlinedIcon color="action" fontSize="small" />

                        <Typography variant="subtitle2" fontWeight={700}>
                            Dokumenty zamówienia
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                            ({documents.length})
                        </Typography>
                    </Stack>

                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FolderZipOutlinedIcon />}
                        disabled={!documents.length || downloading}
                        onClick={downloadZip}
                        sx={{ textTransform: 'none' }}
                    >
                        Pobierz ZIP
                    </Button>
                </Stack>

                {downloading && <LinearProgress />}

                {!documentsEntity.loading && documents.length === 0 && (
                    <Alert severity="info">
                        Brak dokumentów powiązanych z zamówieniem.
                    </Alert>
                )}
            </Stack>

            <PowerTable
                rows={documents}
                columns={columns}
                loading={documentsEntity.loading}
                height={rwd?.height ? rwd.height - 110 : 450}
            />
        </Box>
    );
};

export default ProductOrderDocuments;