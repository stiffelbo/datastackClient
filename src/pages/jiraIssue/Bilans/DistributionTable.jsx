import React, { useMemo } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

const formatNumber = (value, max = 1) =>
    new Intl.NumberFormat("pl-PL", {
        maximumFractionDigits: max,
    }).format(value);

const prepareRows = (items, cumulative) => {
    let runningTotal = 0;

    return items
        .map((item) => {
            const value = Number(item.value) || 0;

            runningTotal += value;

            return {
                ...item,
                value,
                cumulativeValue: cumulative
                    ? runningTotal
                    : null,
            };
        });
};

const DistributionTable = ({
    title,
    showTitle = false,
    items = [],
    valueFormatter = (value) => value,
    cumulative = false,
    cumulativeLabel = "Narastająco",
    showShare = true,
}) => {
    const data = useMemo(
        () => prepareRows(items, cumulative),
        [items, cumulative]
    );

    const total = useMemo(
        () => data.reduce(
            (sum, item) => sum + Number(item.value),
            0
        ),
        [data]
    );

    if (!data.length) {
        return null;
    }

    return (
        <Box mb={2}>
            {showTitle && (<Box
                sx={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    mb: 0.5,
                }}
            >
                <Typography
                    sx={{
                        fontSize: 12,
                        lineHeight: 1.2,
                        fontWeight: 700,
                    }}
                >
                    {title}
                </Typography>

                <Typography
                    sx={{
                        fontSize: 11,
                        lineHeight: 1.2,
                        color: "text.secondary",
                        fontVariantNumeric: "tabular-nums",
                    }}
                >
                    {valueFormatter(total)}
                </Typography>
            </Box>)}

            <TableContainer
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 0.75,
                    overflow: "hidden",
                }}
            >
                <Table
                    size="small"
                    sx={{
                        tableLayout: "fixed",

                        "& .MuiTableCell-root": {
                            borderColor: "divider",
                            px: 1,
                            py: 0.55,
                            fontSize: 11,
                            lineHeight: 1.25,
                        },
                    }}
                >
                    <TableHead>
                        <TableRow
                            sx={{
                                bgcolor: "grey.50",
                            }}
                        >
                            <TableCell
                                sx={{
                                    width: "34%",
                                    fontWeight: 700,
                                    color: "text.secondary",
                                }}
                            >
                                Pozycja
                            </TableCell>

                            <TableCell
                                align="right"
                                sx={{
                                    fontWeight: 700,
                                    color: "text.secondary",
                                }}
                            >
                                Wartość
                            </TableCell>

                            {showShare && (
                                <TableCell
                                    align="right"
                                    sx={{
                                        width: 72,
                                        fontWeight: 700,
                                        color: "text.secondary",
                                    }}
                                >
                                    Udział
                                </TableCell>
                            )}

                            {cumulative && (
                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 700,
                                        color: "text.secondary",
                                    }}
                                >
                                    {cumulativeLabel}
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {data.map((item, index) => {
                            const share = total
                                ? (item.value / total) * 100
                                : 0;

                            return (
                                <TableRow
                                    key={item.key ?? index}
                                    hover
                                    sx={{
                                        "&:last-child td": {
                                            borderBottom: 0,
                                        },

                                        "&:hover": {
                                            bgcolor: "action.hover",
                                        },
                                    }}
                                >
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.75,
                                                minWidth: 0,
                                            }}
                                        >
                                            {item.color && (
                                                <Box
                                                    sx={{
                                                        width: 6,
                                                        height: 16,
                                                        flexShrink: 0,
                                                        borderRadius: 0.25,
                                                        bgcolor: item.color,
                                                    }}
                                                />
                                            )}

                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: 11,
                                                        lineHeight: 1.2,
                                                        fontWeight: 600,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {item.label}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        sx={{
                                            fontWeight: 600,
                                            fontVariantNumeric: "tabular-nums",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {valueFormatter(item.value)}
                                    </TableCell>

                                    {showShare && (
                                        <TableCell
                                            align="right"
                                            sx={{
                                                color: "text.secondary",
                                                fontVariantNumeric: "tabular-nums",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {formatNumber(share)}%
                                        </TableCell>
                                    )}

                                    {cumulative && (
                                        <TableCell
                                            align="right"
                                            sx={{
                                                fontWeight: 700,
                                                fontVariantNumeric: "tabular-nums",
                                                whiteSpace: "nowrap",
                                                bgcolor: "action.hover",
                                            }}
                                        >
                                            {valueFormatter(
                                                item.cumulativeValue
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}

                        <TableRow
                            sx={{
                                bgcolor: "grey.50",

                                "& td": {
                                    borderTop: "1px solid",
                                    borderTopColor: "divider",
                                    borderBottom: 0,
                                },
                            }}
                        >
                            <TableCell
                                sx={{
                                    fontWeight: 700,
                                }}
                            >
                                Razem
                            </TableCell>

                            <TableCell
                                align="right"
                                sx={{
                                    fontWeight: 700,
                                    fontVariantNumeric: "tabular-nums",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {valueFormatter(total)}
                            </TableCell>

                            {showShare && (
                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 600,
                                        color: "text.secondary",
                                    }}
                                >
                                    100%
                                </TableCell>
                            )}

                            {cumulative && (
                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 700,
                                        fontVariantNumeric: "tabular-nums",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {valueFormatter(total)}
                                </TableCell>
                            )}
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default DistributionTable;