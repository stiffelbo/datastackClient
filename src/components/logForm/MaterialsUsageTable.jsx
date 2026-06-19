import React, { useMemo, useState } from "react";
import {
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    TextField,
    Chip,
} from "@mui/material";

import { keyframes } from "@mui/system";

import InputNumber from "./InputNumber";

const pulseDown = keyframes`
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(0.92);
    }
    100% {
        transform: scale(1);
    }
`;

const MaterialsUsageTable = ({
    materials = [],
    value = {},
    onFieldChange,
    disabled = false,
    title = "Materiały",
}) => {

    const [searchPhrase, setSearchPhrase] = useState("");

    const filteredMaterials = useMemo(() => {
        const phrase = searchPhrase.trim().toLowerCase();

        return materials
            .filter((material) => {
                if (!phrase) {
                    return true;
                }

                return String(material.name ?? "")
                    .toLowerCase()
                    .includes(phrase);
            })
            .sort((a, b) => {
                const requiredDiff = Number(b.required) - Number(a.required);

                if (requiredDiff !== 0) {
                    return requiredDiff;
                }

                return String(a.name ?? "").localeCompare(
                    String(b.name ?? ""),
                    "pl",
                    { sensitivity: "base" }
                );
            });
    }, [materials, searchPhrase]);

    const filledMaterialsCount = useMemo(() => {
        return materials.filter((material) => {
            const row = value?.[material.id] ?? {};
            return row.qty !== undefined && row.qty !== null && row.qty !== "";
        }).length;
    }, [materials, value]);

    const hasRequiredWithoutAnyValue = useMemo(() => {
        const hasRequired = materials.some((material) => material.required);
        return hasRequired && filledMaterialsCount === 0;
    }, [materials, filledMaterialsCount]);

    function renderFilter() {
        return (
            <TextField
                size="small"
                label="Szukaj materiału"
                value={searchPhrase}
                onChange={(event) => setSearchPhrase(event.target.value)}
                disabled={disabled}
                fullWidth
            />
        );
    }

    function renderBadge() {
        return (
            <Chip
                size="small"
                label={`${filledMaterialsCount}/${materials.length}`}
                onClick={() => setSearchPhrase("")}
                title="Kliknij, aby wyczyścić filtr"
                color={hasRequiredWithoutAnyValue ? "warning" : "default"}
                variant={hasRequiredWithoutAnyValue ? "filled" : "outlined"}
                sx={{
                    cursor: "pointer",
                    flexShrink: 0,
                    animation: hasRequiredWithoutAnyValue
                        ? `${pulseDown} 1.2s ease-in-out infinite`
                        : "none",
                }}
            />
        );
    }

    function renderEmpty() {
        return null;
    }

    function renderRow(material) {
        const row = value?.[material.id] ?? {};
        const qty = row.qty ?? "";
        const wasteQty = row.wasteQty ?? "";
        const canWaste = Boolean(material.canWaste);

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
                    {canWaste && (
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
                    )}
                    {!canWaste && (
                        <Typography variant="body2" color="text.secondary">
                            —
                        </Typography>
                    )}
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
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="subtitle2" fontWeight={600} sx={{ minWidth: 120 }}>
                            {title}
                        </Typography>

                        {renderFilter()}

                        {renderBadge()}
                    </Stack>
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
                    <TableBody>{filteredMaterials.map(renderRow)}</TableBody>
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