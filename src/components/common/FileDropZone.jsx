
import React, { useRef, useState } from 'react';

import {
    Box,
    Typography,
    Button,
    Paper,
} from '@mui/material';

const createFileItem = (file) => ({
    id: crypto.randomUUID(),
    file,
    type: null,
    title: file.name,
    notes: null,
});

const FileDropZone = ({
    value = [],
    onChange,
    accept,
    multiple = true,
    disabled = false,
}) => {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const addFiles = (fileList) => {
        if (disabled) return;

        const files = Array.from(fileList || []);

        if (!files.length) return;

        const selected = multiple ? files : files.slice(0, 1);

        const newItems = selected.map(createFileItem);

        onChange?.(
            multiple
                ? [...value, ...newItems]
                : newItems
        );
    };

    const removeFile = (id) => {
        onChange?.(
            value.filter(item => item.id !== id)
        );
    };

    const updateFile = (id, field, fieldValue) => {
        onChange?.(
            value.map(item =>
                item.id === id
                    ? { ...item, [field]: fieldValue }
                    : item
            )
        );
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragging(false);

        if (disabled) return;

        addFiles(event.dataTransfer.files);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!disabled) {
            setDragging(true);
        }
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();

        // Nie wyłączamy podświetlenia przy przejściu
        // pomiędzy dziećmi wewnątrz drop zone.
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setDragging(false);
        }
    };

    const handleInputChange = (event) => {
        addFiles(event.target.files);

        // Pozwala ponownie wybrać ten sam plik.
        event.target.value = '';
    };

    return (
        <Box>
            <Paper
                variant="outlined"
                onDragEnter={handleDragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                    p: 3,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    borderColor: dragging
                        ? 'primary.main'
                        : 'divider',
                    backgroundColor: dragging
                        ? 'action.hover'
                        : 'background.paper',
                    textAlign: 'center',
                    cursor: disabled ? 'default' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    transition: '0.2s',
                }}
                onClick={() => {
                    if (!disabled) {
                        inputRef.current?.click();
                    }
                }}
            >
                <Typography variant="body2" fontWeight={600}>
                    Przeciągnij pliki tutaj
                </Typography>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 1 }}
                >
                    lub kliknij, aby wybrać z dysku
                </Typography>

                <Button
                    size="small"
                    variant="outlined"
                    disabled={disabled}
                    onClick={(event) => {
                        event.stopPropagation();
                        inputRef.current?.click();
                    }}
                >
                    Wybierz pliki
                </Button>

                <input
                    ref={inputRef}
                    type="file"
                    hidden
                    accept={accept}
                    multiple={multiple}
                    disabled={disabled}
                    onChange={handleInputChange}
                />
            </Paper>
        </Box>
    );
};

export default FileDropZone;
