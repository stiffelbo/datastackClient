import React from "react";
import {
    Box,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import InputNumber from "./InputNumber";

const MaterialsUsageTable = ({
    materials = [],
    value = {},
    onFieldChange,
    disabled = false,
    title = "Materiały",
}) => {
    function renderEmpty() {
        return null;
    }

    function renderRequiredChip(required) {
        if (!required) return null;

        return (
            <Chip
                size="small"
                label="wymagany"
                color="warning"
                variant="outlined"
            />
        );
    }

    function renderRow(material) {
        const row = value?.[material.id] ?? {};
        const qty = row.qty ?? "";
        const wasteQty = row.wasteQty ?? "";
        const goodQty = row.goodQty ?? "";

        return (
            <TableRow key={material.id} hover>
                <TableCell sx={{ minWidth: 220 }}>
                    <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                            {material.name}
                        </Typography>
                        {renderRequiredChip(material.required)}
                    </Stack>
                </TableCell>

                <TableCell sx={{ width: 90 }}>
                    <Typography variant="body2" color="text.secondary">
                        {material.unit || "—"}
                    </Typography>
                </TableCell>

                <TableCell sx={{ width: 160 }}>
                    <InputNumber
                        label="Ilość"
                        value={qty}
                        min={0}
                        step={material.step}
                        required={material.required}
                        disabled={disabled}
                        onChange={(nextValue) =>
                            onFieldChange?.(material.id, "qty", nextValue)
                        }
                    />
                </TableCell>

                <TableCell sx={{ width: 160 }}>
                    <InputNumber
                        label="Odpad"
                        value={wasteQty}
                        min={0}
                        step={material.step}
                        required={material.required}
                        disabled={disabled}
                        onChange={(nextValue) =>
                            onFieldChange?.(material.id, "wasteQty", nextValue)
                        }
                    />
                </TableCell>

                <TableCell sx={{ width: 160 }}>
                    <InputNumber
                        label="Dobra"
                        value={goodQty}
                        min={0}
                        step={material.step}
                        disabled
                        onChange={() => {}}
                    />
                </TableCell>
            </TableRow>
        );
    }

    function renderTable() {
        return (
            <Box
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                }}
            >
                <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        {title}
                    </Typography>
                </Box>

                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Materiał</TableCell>
                            <TableCell>Jm</TableCell>
                            <TableCell>Ilość</TableCell>
                            <TableCell>Odpad</TableCell>
                            <TableCell>Dobra</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{materials.map(renderRow)}</TableBody>
                </Table>
            </Box>
        );
    }

    if (!Array.isArray(materials) || materials.length === 0) {
        return renderEmpty();
    }

    return renderTable();
};

export default MaterialsUsageTable;