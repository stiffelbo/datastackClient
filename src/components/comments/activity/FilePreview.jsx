import React from 'react';

import {
    Box,
    Link,
    Typography,
} from '@mui/material';


const FilePreview = ({
    file,
}) => {

    const mime = file.content?.mime ?? '';
    const isImage = mime.startsWith('image/');

    if (isImage) {
        return (
            <Box>
                <Box
                    component="img"
                    src={file.url}
                    alt={file.name}
                    loading="lazy"
                    sx={{
                        display: 'block',
                        width: 'auto',
                        maxWidth: '100%',
                        maxHeight: 450,
                        objectFit: 'contain',
                        borderRadius: 1,
                    }}
                />

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display: 'block',
                        mt: 0.5,
                    }}
                >
                    {file.name}
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Link
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
            >
                {file.name}
            </Link>

            {mime && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display: 'block',
                    }}
                >
                    {mime}
                </Typography>
            )}
        </Box>
    );
};

export default FilePreview;