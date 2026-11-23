
import React, { useState } from "react";

import {
    Box,
    Stack,
    Typography,
    Button,
    Chip,
    Tooltip,
    Alert,
    Divider,
    CircularProgress,
} from "@mui/material";

import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

import ProductionRouteItem from "./ProductionRouteItem";

const ProductionRoutesList = ({ data = [], production }) => {
    const [importing, setImporting] = useState(null);

    const routes = data ?? [];
    const historyMode = production.history?.mode ?? null;
    const qtyToDo = production.history?.qtyToDo ?? null;

    const handleImport = async (route) => {
        if (importing !== null) return;

        setImporting(route.signature);

        try {
            await production.actions.importRoute(route, {
                position: 'end',
            });
        } catch (error) {
            console.error('Błąd importu marszruty:', error);
        } finally {
            setImporting(null);
        }
    };

    if (!routes.length) {
        return (
            <Alert severity="info" sx={{ m: 1 }}>
                Brak historycznych marszrut dla tego kontekstu produkcyjnego.
            </Alert>
        );
    }

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
                    Historyczne marszruty
                </Typography>

                <Chip
                    size="small"
                    variant="outlined"
                    label={`${routes.length} wariantów`}
                    sx={{ height: 22, fontSize: 11 }}
                />

                <Tooltip title="Liczba zadań w aktualnej marszrucie">
                    <Chip
                        size="small"
                        variant="outlined"
                        label={`Aktualne: ${production.tasks.length}`}
                        sx={{ height: 22, fontSize: 11 }}
                    />
                </Tooltip>
                <Chip
                    size="small"
                    variant="outlined"
                    label={`Tryb: ${historyMode ?? 'nieznany'}`}
                    sx={{ height: 22, fontSize: 11 }}
                />
            </Stack>

            {/* Kolumny marszrut */}
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
                    {routes.map((route, index) => (
                        <ProductionRouteItem
                            key={route.signature ?? index}
                            data={route}
                            index={index}
                            historyMode={historyMode}
                            qtyToDo={qtyToDo}
                            onImport={() => handleImport(route)}
                            importing={importing === route.signature}
                            disabled={importing !== null || production.loading}
                        />
                    ))}
                </Stack>
            </Box>
        </Box>
    );
};

export default ProductionRoutesList;
