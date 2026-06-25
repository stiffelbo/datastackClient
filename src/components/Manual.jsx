import React, { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";

import http from "../http";
import { useRwd } from "../context/RwdContext";

import DocRenderer from "./DocRenderer";

const Manual = ({
    name = "LogFormDoc",
    label = "Pomoc",
    endpoint = "/documentation/get.php",
    buttonVariant = "outlined",
    buttonSize = "small",
    iconOnly = true,
    sx={}
}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);

    const rwd = useRwd();

    const isMobile = Number(rwd?.screen?.width ?? rwd?.width ?? 0) < 768;

    async function fetchManual() {
        if (!name) return;

        setLoading(true);
        setError("");

        try {
            const response = await http.get(endpoint, {
                params: {
                    docName: name,
                },
            });

            const nextData = response.data ?? null;

            if (!nextData) {
                throw new Error("Manual data is empty");
            }

            setData(nextData);
        } catch (err) {
            setError("Nie udało się pobrać instrukcji.");
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    function handleOpen() {
        setShowModal(true);

        if (!data && !loading) {
            fetchManual();
        }
    }

    function handleClose() {
        setShowModal(false);
    }

    useEffect(() => {
        setData(null);
        setError("");

        if (showModal) {
            fetchManual();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name]);

    return (
        <>
            {iconOnly ? (
                <Tooltip title={label}>
                    <IconButton
                        size={buttonSize}
                        onClick={handleOpen}
                        disabled={loading}
                        color={"warning"}
                    >
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ) : (
                <Button
                    size={buttonSize}
                    variant={buttonVariant}
                    startIcon={<HelpOutlineIcon />}
                    onClick={handleOpen}
                    disabled={loading}
                >
                    {label}
                </Button>
            )}

            <Dialog
                open={showModal}
                onClose={handleClose}
                fullWidth
                maxWidth="xl"
                fullScreen={isMobile}
            >
                <DialogTitle>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                    >
                        <Typography variant="h6">
                            {data?.title || "Instrukcja"}
                        </Typography>

                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent dividers>
                    {loading && (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <CircularProgress size={20} />
                            <Typography variant="body2">
                                Ładowanie instrukcji...
                            </Typography>
                        </Stack>
                    )}

                    {!loading && error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    {!loading && !error && data && (
                        <Box>
                            <DocRenderer data={data} />
                        </Box>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>
                        Zamknij
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Manual;