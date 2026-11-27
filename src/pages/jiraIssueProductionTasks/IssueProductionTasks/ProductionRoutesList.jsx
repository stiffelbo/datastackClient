import React, { useState } from "react";

import {
    Box,
    Stack,
    Typography,
    Button,
    TextField,
    Alert,
    CircularProgress,
} from "@mui/material";

import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import ProductionRouteItem from "./ProductionRouteItem";

const ProductionRouteImportForm = ({
    value,
    onChange,
    onSubmit,
    disabled,
    importing,
}) => {
    const sourceReferenceId = Number(value);
    const isValid = Number.isSafeInteger(sourceReferenceId) && sourceReferenceId > 0;

    const handleSubmit = (event) => {
        event.preventDefault();

        if (disabled || !isValid) return;

        onSubmit(sourceReferenceId);
    };

    return (
        <Stack
            component="form"
            direction="row"
            alignItems="center"
            spacing={1}
            onSubmit={handleSubmit}
        >
            <TextField
                size="small"
                label="ID zamówienia"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                slotProps={{
                    htmlInput: {
                        inputMode: 'numeric',
                    },
                }}
                sx={{ width: 150 }}
            />

            <Button
                type="submit"
                size="small"
                variant="outlined"
                disabled={disabled || !isValid}
                startIcon={
                    importing
                        ? <CircularProgress size={16} />
                        : <AddCircleOutlineIcon />
                }
                sx={{ whiteSpace: 'nowrap' }}
            >
                Importuj marszrutę
            </Button>
        </Stack>
    );
};

const ProductionRoutesList = ({ data = [], production }) => {
    const [importing, setImporting] = useState(null);
    const [error, setError] = useState(null);
    const [sourceOrderId, setSourceOrderId] = useState('');

    const routes = data ?? [];
    const historyMode = production.history?.mode ?? null;
    const qtyToDo = production.history?.qtyToDo ?? null;

    const hasRoutes = routes.length > 0;
    const hasTasks = (production.tasks?.length ?? 0) > 0;
    const disabled = importing !== null || production.loading || hasTasks;

    const handleImport = async ({
        sourceReferenceId,
        signature,
    }) => {
        if (disabled) return;

        if (!Number.isSafeInteger(sourceReferenceId) || sourceReferenceId <= 0) {
            setError('Brak identyfikatora marszruty źródłowej.');
            return;
        }

        setError(null);
        setImporting(signature);

        try {
            await production.actions.import(
                sourceReferenceId,
            );

            if (signature === 'manual') {
                setSourceOrderId('');
            }
        } catch (error) {
            setError(error.message || 'Nie udało się zaimportować marszruty.');
        } finally {
            setImporting(null);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                minWidth: 0,
                minHeight: 0,
                overflow: 'hidden',
                bgcolor: 'background.default',
            }}
        >
            {/* Nagłówek */}
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                    px: 1.5,
                    py: 0.85,
                    bgcolor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <RouteOutlinedIcon
                    sx={{ fontSize: 19, color: 'text.secondary' }}
                />

                <Typography
                    variant="subtitle2"
                    sx={{ fontSize: 13, fontWeight: 700, flex: 1 }}
                >
                    {hasRoutes ? 'Historyczne marszruty' : 'Import marszruty'}
                </Typography>

                <ProductionRouteImportForm
                    value={sourceOrderId}
                    onChange={setSourceOrderId}
                    onSubmit={(sourceReferenceId) => handleImport({
                        sourceReferenceId,
                        signature: 'manual',
                    })}
                    disabled={disabled}
                    importing={importing === 'manual'}
                />
            </Stack>

            {/* Kolumny marszrut */}
            {hasRoutes ? (
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        minWidth: 0,
                        overflowX: 'auto',
                        overflowY: 'auto',
                        p: 1.25,
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="flex-start"
                        sx={{
                            width: 'max-content',
                            minWidth: '100%',
                            pb: 1,
                        }}
                    >
                        {routes.map((route, index) => {
                            const signature = route.signature ?? `route-${index}`;

                            return (
                                <ProductionRouteItem
                                    key={signature}
                                    data={route}
                                    index={index}
                                    historyMode={historyMode}
                                    qtyToDo={qtyToDo}
                                    onImport={() => handleImport({
                                        sourceReference: route.reference ?? 'productOrder',
                                        sourceReferenceId: Number(route.orderIds?.[0]),
                                        signature,
                                    })}
                                    importing={importing === signature}
                                    disabled={disabled}
                                />
                            );
                        })}
                    </Stack>
                </Box>
            ) : (
                <Alert severity="info" sx={{ m: 1.25 }}>
                    Brak historycznych marszrut dla tego kontekstu produkcyjnego.
                </Alert>
            )}

            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError(null)}
                    sx={{ mx: 1.25, mt: 1 }}
                >
                    {error}
                </Alert>
            )}

            {hasTasks && (
                <Alert severity="info" sx={{ mx: 1.25, mt: 1 }}>
                    Import marszruty jest dostępny wyłącznie dla zleceń bez zadań produkcyjnych.
                </Alert>
            )}
        </Box>
    );
};

export default ProductionRoutesList;