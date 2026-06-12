import React from 'react';
import {
    Alert,
    IconButton,
    Link,
    Stack,
    Box,
    Typography,

} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function TaskInfo({
    data,
    onAdd = null,
    onRemove = null,
    showDelete = true,
    sx = {},
    children = null,
    onMoveDown,
    onMoveUp,
    disableMoveDown,
    disableMoveUp,
    isList = false
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
        if (!isList && typeof onAdd === "function") {
            return (
                <IconButton
                    size="small"
                    color="success"
                    title='Dodaj do listy'
                    onClick={handleAdd}
                    sx={{ flexShrink: 0 }}
                >
                    <AddIcon />
                </IconButton>
            );
        }

        if (isList && typeof onRemove === "function" && showDelete) {
            return (
                <IconButton
                    size="small"
                    color="error"
                    title='Usuń z listy'
                    onClick={handleRemove}
                    sx={{ flexShrink: 0 }}
                >
                    <DeleteOutlineIcon />
                </IconButton>
            );
        }

        return null;
    }

    function renderChildren() {
        if (!children) return null;
        return children;
    }

    function renderMoveButtons() {
        if (isList) {
            return <Stack direction={'row'}>
                <IconButton
                    size="small"
                    onClick={onMoveUp}
                    disabled={disableMoveUp}
                    title="Przesuń wyżej"
                >
                    <KeyboardArrowUpIcon fontSize="small" />
                </IconButton>

                <IconButton
                    size="small"
                    onClick={onMoveDown}
                    disabled={disableMoveDown}
                    title="Przesuń niżej"
                >
                    <KeyboardArrowDownIcon fontSize="small" />
                </IconButton>
            </Stack>
        }
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
                        {renderAction()}
                        {renderMoveButtons()}
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


                </Stack>



                <Stack direction="row" spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
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
                    {data.qtyToDo ? (
                        <Typography variant="caption" color="text.secondary">
                            Do zrobienia: {data.qtyToDo}
                        </Typography>
                    ) : null}
                </Stack>


                <Box sx={{ width: '100%' }}>
                    {renderChildren()}
                </Box>
            </Stack>
        </Box>
    );
}