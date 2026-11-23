
import React, { useState } from "react";

import {
    Box,
    Paper,
    Stack,
    Typography,
    Chip,
    IconButton,
    Tooltip,
} from "@mui/material";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import ProductionNr from "./ProductionNr";
import ProductionCardPrint from "./ProductionCardPrint";

const ProductOrderHeader = ({ id, data, onNumberChange }) => {
    const [imageError, setImageError] = useState(false);

    const active = Number(data?.is_active) === 1;
    const prodNumber = data ? data.order_number : null;

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                borderRadius: 1.5,
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                    sx={{
                        width: 110,
                        height: 110,
                        flexShrink: 0,
                        borderRadius: 1,
                        overflow: "hidden",
                        bgcolor: "action.hover",
                        border: 1,
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {data?.profileUrl && !imageError ? (
                        <Box
                            component="img"
                            src={data.profileUrl}
                            alt={data.design || "Wizualizacja produktu"}
                            onError={() => setImageError(true)}
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                            }}
                        />
                    ) : (
                        <Inventory2OutlinedIcon
                            sx={{ fontSize: 30, color: "text.disabled" }}
                        />
                    )}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={0.75}
                        sx={{ mb: 0.5 }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            Zamówienie #{id}
                        </Typography>

                        <Chip
                            size="small"
                            label={active ? "Aktywne" : "Nieaktywne"}
                            color={active ? "success" : "default"}
                            variant="outlined"
                            sx={{ height: 21, fontSize: 11 }}
                        />

                        {data?.productType && (
                            <Chip
                                size="small"
                                label={data.productType}
                                variant="outlined"
                                sx={{ height: 21, fontSize: 11 }}
                            />
                        )}
                    </Stack>

                    <Stack direction="row" alignItems="flex-start" spacing={0.5}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                lineHeight: 1.4,
                                overflowWrap: "anywhere",
                            }}
                        >
                            {data?.design || data?.label || "Produkt"}
                        </Typography>
                    </Stack>

                    <Stack
                        direction="row"
                        flexWrap="wrap"
                        alignItems="center"
                        gap={2}
                        sx={{ mt: 1.5 }}
                    >
                        <Box>
                            <ProductionNr
                                id={id}
                                value={prodNumber}
                                onChange={onNumberChange}
                            />
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Realizacja
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {data?.realization_no ?? "—"}
                            </Typography>
                        </Box>
                         <ProductionCardPrint
                                id={id}
                                printedAt={data?.production_card_printed_at}
                                url="/product_order/productionCard.php"
                            />
                    </Stack>
                </Box>
            </Stack>
        </Paper>
    );
};

export default ProductOrderHeader;
