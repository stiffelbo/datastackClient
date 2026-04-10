import React from 'react';
import {
    Alert,
    Button,
    Link,
    Stack,
    Box,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export default function TaskInfo({
    data,
    onAdd = null,
    onRemove = null,
    sx = {},
    children = null,
}) {
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

    function renderAction() {
        if (typeof onAdd === "function") {
            return (
                <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    sx={{ flexShrink: 0 }}
                >
                    Dodaj
                </Button>
            );
        }

        if (typeof onRemove === "function") {
            return (
                <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={handleRemove}
                    sx={{ flexShrink: 0 }}
                >
                    Usuń
                </Button>
            );
        }

        return null;
    }

    function renderChildren() {
        if (!children) return null;
        return children;
    }

    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 1.5,
                bgcolor: "background.paper",
                ...sx,
            }}
        >
            <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                    <Stack direction="row" spacing={1} alignItems="center">
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

                        {data.name ? (
                            <Typography variant="body2">
                                {data.name}
                            </Typography>
                        ) : null}
                    </Stack>


                    {renderAction()}
                </Stack>



                <Stack direction="row" spacing={2} sx={{ marginTop: 1 , marginBottom: 1}}>
                    {data.jiraParentKey ? (
                        <Typography variant="caption" color="text.secondary">
                            Parent: {data.jiraParentKey}
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


                <Box fullWidth>
                    {renderChildren()}
                </Box>
            </Stack>
        </Box>
    );
}