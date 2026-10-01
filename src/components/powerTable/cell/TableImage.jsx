import React from 'react';

import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';

function TableImage({
    src,
    alt = 'Brak obrazu',
    height = "90%",
    className = '',
}) {
    if (!src) {
        return (
            <ImageNotSupportedOutlinedIcon
                titleAccess={alt}
                color="disabled"
                sx={{ fontSize: height * 0.6 }}
            />
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            title={alt}
            loading="lazy"
            className={`table-image ${className}`}
            onError={(e) => {
                e.currentTarget.style.display = 'none';
            }}
            style={{
                height,
                width: 'auto',
                maxWidth: '100%',
                objectFit: 'contain',
                display: 'block',
            }}
        />
    );
}

export default TableImage;