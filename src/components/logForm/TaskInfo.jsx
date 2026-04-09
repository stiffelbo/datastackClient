import React from 'react';
import {
    Alert,
    Button,
    Link,
    Stack,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export default function TaskInfo({ data, onAdd = null, onRemove = null, sx = {} }) {
    if (!data) return null;

    if (!data.id) {
        return (
            <Alert severity="error" variant="outlined" sx={sx}>
                Nieprawidłowa odpowiedź z serwera. Brak danych taska.
            </Alert>
        );
    }

    const handleAdd = () => {
        if (typeof onAdd === 'function') {
            onAdd(data);
        }
    };

    const handleRemove = () => {
        if (typeof onRemove === 'function') {
            onRemove(data);
        }
    };

    const renderAction = () => {
        if (typeof onAdd === 'function') {
            return (
                <Button
                    size="small"
                    color="inherit"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                >
                    Dodaj
                </Button>
            );
        }

        if (typeof onRemove === 'function') {
            return (
                <Button
                    size="small"
                    color="inherit"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={handleRemove}
                >
                    Usuń
                </Button>
            );
        }

        return null;
    };

    return (
        <Alert
            severity="info"
            variant="outlined"
            action={renderAction()}
            sx={sx}
        >
            <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="body2" fontWeight={700}>
                        {data.jiraKey || '—'}
                    </Typography>

                    {data.jiraUrl ? (
                        <Link
                            href={data.jiraUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            variant="caption"
                        >
                            Link do Jiry
                        </Link>
                    ) : null}
                </Stack>

                {data.name ? (
                    <Typography variant="body2">
                        {data.name}
                    </Typography>
                ) : null}

                <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                    {data.jiraProjectLabel ? (
                        <Typography variant="caption" color="text.secondary">
                            Projekt: {data.jiraProjectLabel}
                        </Typography>
                    ) : null}

                    {data.productGroup ? (
                        <Typography variant="caption" color="text.secondary">
                            Typ: {data.productGroup}
                        </Typography>
                    ) : null}

                    {data.status ? (
                        <Typography variant="caption" color="text.secondary">
                            Status: {data.status}
                        </Typography>
                    ) : null}
                </Stack>

                {data.jiraParentKey ? (
                    <Typography variant="caption" color="text.secondary">
                        Parent: {data.jiraParentKey}
                    </Typography>
                ) : null}
            </Stack>
        </Alert>
    );
}