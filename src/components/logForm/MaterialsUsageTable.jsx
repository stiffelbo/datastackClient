import React from "react";
import {
    Box,
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

    function renderRow(material) {
        const row = value?.[material.id] ?? {};
        const qty = row.qty ?? "";
        const wasteQty = row.wasteQty ?? "";

        const labelTitle = material.required ? "wartość jest wymagana" : "";

        return (
            <TableRow key={material.id} hover>
                <TableCell sx={{ minWidth: 160 }}>
                    <Stack spacing={0.5}>
                        <Typography
                            variant="body2"
                            fontWeight={600}
                            title={labelTitle}
                            sx={{
                                color: material.required ? "warning.main" : "text.primary",
                            }}
                        >
                            {material.name}
                        </Typography>
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
                        required={false}
                        disabled={disabled}
                        onChange={(nextValue) =>
                            onFieldChange?.(material.id, "wasteQty", nextValue)
                        }
                    />
                </TableCell>
            </TableRow>
        );
    }

    function renderTable() {
        const sortedMaterials = [...materials].sort(
            (a, b) => Number(b.required) - Number(a.required)
        );

        return (
            <Box
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        p: 2,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                    }}
                >
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
                        </TableRow>
                    </TableHead>
                    <TableBody>{sortedMaterials.map(renderRow)}</TableBody>
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