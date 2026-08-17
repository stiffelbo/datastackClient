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

const CompactField = ({
    label,
    value,
    formatter,
    strong = false,
    alertWhenMissing = true,
}) => {
    const missing = isMissing(value);

    const displayValue = missing
        ? "Brak danych"
        : formatter
            ? formatter(value)
            : value;

    return (
        <Box sx={{minWidth: 0}}>
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
                    fontSize: strong ? 14 : 12,
                    lineHeight: 1.25,
                    fontWeight: strong ? 700 : 500,
                    color: missing && alertWhenMissing
                        ? "warning.main"
                        : "text.primary",
                    overflowWrap: "anywhere",
                }}
            >
                {displayValue}
            </Typography>
        </Box>
    );
};

export default CompactField;