
import React, { useState } from "react";

import {
    Box,
    Button,
    Tooltip,
    Typography,
    CircularProgress,
} from "@mui/material";

import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import http from "../../http";

const ProductionCardPrint = ({
    id,
    printedAt = null,
    url,
    disabled = false,
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePrint = async () => {
       
    };

    const formattedDate = printedAt
        ? new Date(printedAt.replace(" ", "T")).toLocaleString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : null;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Tooltip title="Pobierz i otwórz kartę produkcyjną">
                    <span>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PrintOutlinedIcon />}
                            onClick={handlePrint}
                            disabled={!id || !url || disabled || loading}
                            sx={{ textTransform: "none", fontSize: 12 }}
                        >
                            {"Karta produkcyjna"}
                        </Button>
                    </span>
                </Tooltip>
            </Box>

            {error && (
                <Typography variant="caption" color="error">
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default ProductionCardPrint;
