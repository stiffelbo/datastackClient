import React, { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Collapse,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const RenderLogErrors = ({ errors = [] }) => {
    const [show, setShow] = useState(false);

    const normalizedErrors = useMemo(() => {
        if (!Array.isArray(errors)) return [];
        return errors.filter(Boolean);
    }, [errors]);

    if (!normalizedErrors.length) return null;

    function handleToggle() {
        setShow((prev) => !prev);
    }

    function renderSummary() {
        return (
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
            >
                <IconButton
                    size="small"
                    onClick={handleToggle}
                    sx={{
                        color: "inherit",
                        transform: show ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                    }}
                >
                    <ExpandMoreIcon fontSize="small" />
                </IconButton>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight={600}>
                        Do uzupełnienia: {normalizedErrors.length}
                    </Typography>
                </Stack>

                
            </Stack>
        );
    }

    function renderDetails() {
        return (
            <Collapse in={show} timeout="auto" unmountOnExit>
                <Box sx={{ pt: 1 }}>
                    <Stack spacing={0.75}>
                        {normalizedErrors.map((error, index) => (
                            <Typography
                                key={`${error}-${index}`}
                                variant="body2"
                                sx={{ pl: 0.5 }}
                            >
                                • {error}
                            </Typography>
                        ))}
                    </Stack>
                </Box>
            </Collapse>
        );
    }

    return (
        <Alert
            severity="warning"
            variant="outlined"
            icon={false}
            sx={{
                width: "100%",
                px: 0,
                alignItems: "flex-start",
                animation: "logErrorPulse 1.8s ease-in-out infinite",
                "@keyframes logErrorPulse": {
                    "0%": {
                        boxShadow: "0 0 0 0 rgba(237, 108, 2, 0.35)",
                    },
                    "70%": {
                        boxShadow: "0 0 0 10px rgba(237, 108, 2, 0)",
                    },
                    "100%": {
                        boxShadow: "0 0 0 0 rgba(237, 108, 2, 0)",
                    },
                },
            }}
        >
            {renderSummary()}
            {renderDetails()}
        </Alert>
    );
};

export default RenderLogErrors;