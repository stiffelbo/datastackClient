import React from "react";

// MUI imports
import {
    Alert,
    Box,
    Chip,
    Collapse,
    Divider,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import {isMissing} from './dto';

const SummaryValue = ({
    label,
    value,
    formatter = formatCurrency,
    emphasize = false,
}) => {
    const missing = isMissing(value);

    return (
        <Box
            sx={{
                minWidth: 0,
                px: 1.25,
                py: 0.875,
                borderLeft: 2,
                borderColor: emphasize
                    ? "primary.main"
                    : "divider",
                bgcolor: emphasize
                    ? "action.hover"
                    : "transparent",
            }}
        >
            <Typography
                sx={{
                    fontSize: 11,
                    lineHeight: 1.2,
                    color: "text.secondary",
                }}
            >
                {label}
            </Typography>

            <Typography
                sx={{
                    mt: 0.25,
                    fontSize: 14,
                    lineHeight: 1.25,
                    fontWeight: 700,
                    color: missing
                        ? "warning.main"
                        : "text.primary",
                }}
            >
                {missing ? "Brak danych" : formatter(value)}
            </Typography>
        </Box>
    );
};


export default SummaryValue;