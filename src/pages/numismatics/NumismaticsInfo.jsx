
import React, { useState } from 'react';

import {
    Box,
    Paper,
    Stack,
    Typography,
    Chip,
    Divider,
    LinearProgress,
    Alert,
    Skeleton,
} from '@mui/material';

import TollOutlinedIcon from '@mui/icons-material/TollOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';

import useEntity from '../../hooks/useEntity';
import { imageUploadService } from '../../services/numismatics/imageUploadService';

import FileForm from '../../components/common/FileForm';
import NumismaticsScanForm from './NumismaticsScanForm';

const SIDES = [
    {
        key: 'obverse_image',
        side: 'awers',
        label: 'Awers',
    },
    {
        key: 'reverse_image',
        side: 'rewers',
        label: 'Rewers',
    },
];

const NumismaticInfo = ({ id, canUpload = true }) => {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const entity = useEntity({
        endpoint: 'numismatics',
        entityName: 'NumismaticsInfo',
        query: { id },
    });

    const data = entity.rows?.[0];

    const handleImage = async (field, value) => {
        setError(null);

        try {
            await imageUploadService({
                id,
                field,
                value,
                onUpload: entity.getOne,
                setLoading: setSaving,
            });
        } catch (err) {
            setError(
                err?.message || 'Nie udało się zapisać zdjęcia.'
            );
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

            {/* Dwie strony monety */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                    },
                }}
            >

                {/* Awers */}
                <Box
                    sx={{
                        minWidth: 0,
                        p: 2,
                    }}
                >
                    <Stack spacing={1.5}>
                        {entity.loading && !data ? (
                            <Skeleton variant="rounded" height={220} />
                        ) : (
                            <FileForm
                                name="obverse_image"
                                label="Awers"
                                url={data?.obverse_image}
                                showFile
                                compact
                                accept="image/*"
                                disabled={!canUpload || saving}
                                onSubmit={(file) =>
                                    handleImage('obverse_image', file)
                                }
                            />
                        )}

                        <Divider />

                        <NumismaticsScanForm
                            id={id}
                            side="awers"
                            canUpload={canUpload}
                        />
                    </Stack>
                </Box>

                {/* Rewers */}
                <Box
                    sx={{
                        minWidth: 0,
                        p: 2,
                        borderLeft: {
                            xs: 0,
                            sm: 1,
                        },
                        borderTop: {
                            xs: 1,
                            sm: 0,
                        },
                        borderColor: 'divider',
                    }}
                >
                    <Stack spacing={1.5}>
                        {entity.loading && !data ? (
                            <Skeleton variant="rounded" height={220} />
                        ) : (
                            <FileForm
                                name="reverse_image"
                                label="Rewers"
                                url={data?.reverse_image}
                                showFile
                                compact
                                accept="image/*"
                                disabled={!canUpload || saving}
                                onSubmit={(file) =>
                                    handleImage('reverse_image', file)
                                }
                            />
                        )}

                        <Divider />

                        <NumismaticsScanForm
                            id={id}
                            side="rewers"
                            canUpload={canUpload}
                        />
                    </Stack>
                </Box>

            </Box>
        </Paper>
    );
};

export default NumismaticInfo;
