import React from "react";
import {
    Box,
    Paper,
    Typography,
} from "@mui/material";

const ProductContent = ({ data }) => {
    if (!data) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="text.secondary">
                    Brak danych produktu
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Paper
                variant="outlined"
                sx={{
                    overflow: "hidden",
                    bgcolor: "background.paper",
                }}
            >
                <Box
                    sx={{
                        px: 2,
                        py: 1.25,
                        borderBottom: 1,
                        borderColor: "divider",
                        bgcolor: "action.hover",
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        fontWeight={600}
                    >
                        Product JSON
                    </Typography>
                </Box>

                <Box
                    component="pre"
                    sx={{
                        m: 0,
                        p: 2,
                        maxHeight: "70vh",
                        overflow: "auto",

                        fontFamily: "monospace",
                        fontSize: 13,
                        lineHeight: 1.6,

                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",

                        bgcolor: "grey.900",
                        color: "grey.100",
                    }}
                >
                    {JSON.stringify(data, null, 2)}
                </Box>
            </Paper>
        </Box>
    );
};

export default ProductContent;