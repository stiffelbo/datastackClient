
import React, { useState } from 'react';

import {
    Box,
    Paper,
    LinearProgress,
    Alert,
    Skeleton,
} from '@mui/material';

import useEntity from '../../hooks/useEntity';
import { imageUploadService } from '../../services/numismatics/imageUploadService';

import FileForm from '../../components/common/FileForm';

const NumismaticAccessoryInfo = ({ id, canUpload = true }) => {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const entity = useEntity({
        endpoint: 'numismatic_accessories',
        entityName: 'NumismaticAccessoriesInfo',
        query: { id },
    });

    const data = entity.rows?.[0];

    const handleImage = async (value) => {
        setError(null);

        try {
            await imageUploadService({
                id: id,
                endpoint: '/numismatic_accessories/files.php',
                field: 'img_url',
                value,
                onUpload: entity.getOne,
                setLoading: setSaving,
            });
        } catch (err) {
            setError(err?.message || 'Nie udało się zapisać zdjęcia.');
            throw err;
        }
    };

    if (!id) return null;

    return (
        <Paper
            variant="outlined"
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: 'background.paper',
            }}
        >
            {(entity.loading || saving) && <LinearProgress />}

            {error && (
                <Alert severity="error" sx={{ m: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ p: 2 }}>
                {entity.loading && !data ? (
                    <Skeleton variant="rounded" height={220} />
                ) : (
                    <FileForm
                        name="img_url"
                        label="Zdjęcie akcesorium"
                        url={data?.img_url}
                        showFile
                        compact
                        accept="image/*"
                        disabled={!canUpload || saving}
                        onSubmit={handleImage}
                    />
                )}
            </Box>
        </Paper>
    );
};

export default NumismaticAccessoryInfo;
