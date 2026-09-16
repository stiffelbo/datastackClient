import React, { useEffect, useMemo, useState } from "react";

import {
    Box,
    IconButton,
    Paper,
    Tooltip,
    Typography,
} from "@mui/material";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import { typeIcons } from "../../components/powerTable/utils";


const delimiter = ",";


const parseValue = (value) => {
    if (!value) return [];

    return `${value}`
        .split(delimiter)
        .map((field) => field.trim())
        .filter(Boolean);
};


const FieldsAccessControl = ({
    schema = [],
    value = "",
    onSubmit,
    label,
}) => {

    const [selectedFields, setSelectedFields] = useState(
        () => parseValue(value)
    );

    /*
     * false = pokaż wszystkie
     * true  = pokaż tylko restricted / ukryte
     */
    const [showRestrictedOnly, setShowRestrictedOnly] = useState(false);


    useEffect(() => {
        setSelectedFields(parseValue(value));
    }, [value]);


    const selectedSet = useMemo(
        () => new Set(selectedFields),
        [selectedFields]
    );


    /*
     * Filtrowanie jest wyłącznie wizualne.
     * Nie wpływa na value ani onSubmit.
     */
    const visibleSchema = useMemo(() => {
        if (!showRestrictedOnly) {
            return schema;
        }

        return schema.filter(
            (item) => selectedSet.has(item.field)
        );
    }, [
        schema,
        selectedSet,
        showRestrictedOnly,
    ]);


    const submit = (fields) => {
        const fieldSet = new Set(fields);

        const orderedFields = schema
            .map((item) => item.field)
            .filter((field) => fieldSet.has(field));

        setSelectedFields(orderedFields);

        onSubmit?.(
            orderedFields.join(delimiter)
        );
    };


    const toggleField = (field) => {
        if (selectedSet.has(field)) {
            submit(
                selectedFields.filter(
                    (selectedField) => selectedField !== field
                )
            );

            return;
        }

        submit([
            ...selectedFields,
            field,
        ]);
    };


    const restrictedCount = schema.filter(
        (item) => selectedSet.has(item.field)
    ).length;


    return (
        <Paper
            variant="outlined"
            sx={{
                minWidth: 340,
                maxWidth: "100%",
                mr: 1,
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                    py: 0.75,
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: "action.hover",
                }}
            >
                <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{
                        flex: 1,
                    }}
                >
                    {label}
                </Typography>


                {/* Counter */}
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        mr: 0.75,
                        fontVariantNumeric: "tabular-nums",
                    }}
                >
                    {restrictedCount} / {schema.length}
                </Typography>


                {/* Filter */}
                <Tooltip
                    title={
                        showRestrictedOnly
                            ? "Pokaż wszystkie pola"
                            : "Pokaż tylko ukryte"
                    }
                    placement="top"
                >
                    <IconButton
                        size="small"
                        onClick={() => {
                            setShowRestrictedOnly(
                                (current) => !current
                            );
                        }}
                        aria-label={
                            showRestrictedOnly
                                ? "Pokaż wszystkie pola"
                                : "Pokaż tylko ukryte pola"
                        }
                        sx={{
                            color: showRestrictedOnly
                                ? "error.main"
                                : "primary.main",

                            transition:
                                "color 120ms ease, background-color 120ms ease",

                            "&:hover": {
                                bgcolor: showRestrictedOnly
                                    ? "error.main"
                                    : "primary.main",

                                color: showRestrictedOnly
                                    ? "error.contrastText"
                                    : "primary.contrastText",
                            },
                        }}
                    >
                        {showRestrictedOnly
                            ? (
                                <VisibilityOffOutlinedIcon
                                    fontSize="small"
                                />
                            )
                            : (
                                <VisibilityOutlinedIcon
                                    fontSize="small"
                                />
                            )
                        }
                    </IconButton>
                </Tooltip>
            </Box>


            {/* Fields */}
            <Box>
                {visibleSchema.map((item, index) => {

                    const {
                        field,
                        headerName,
                        type,
                    } = item;

                    const restricted = selectedSet.has(field);


                    return (
                        <Box
                            key={field}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                minHeight: 46,
                                px: 1.5,
                                gap: 1,

                                borderBottom:
                                    index < visibleSchema.length - 1
                                        ? 1
                                        : 0,

                                borderColor: "divider",

                                opacity: restricted
                                    ? 0.55
                                    : 1,

                                transition:
                                    "background-color 120ms ease, opacity 120ms ease",

                                "&:hover": {
                                    bgcolor: "action.hover",
                                    opacity: 1,
                                },
                            }}
                        >
                            {/* Type */}
                            <Tooltip title={type || ""}>
                                <Box
                                    sx={{
                                        width: 24,
                                        flexShrink: 0,
                                        textAlign: "center",
                                        fontSize: 16,
                                    }}
                                >
                                    {typeIcons[type] ?? "•"}
                                </Box>
                            </Tooltip>


                            {/* Name */}
                            <Box
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight={500}
                                    noWrap
                                    sx={{
                                        lineHeight: 1.25,
                                    }}
                                >
                                    {headerName || field}
                                </Typography>

                                {headerName && headerName !== field && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        noWrap
                                        sx={{
                                            display: "block",
                                            fontFamily: "monospace",
                                            fontSize: 10,
                                            lineHeight: 1.25,
                                        }}
                                    >
                                        {field}
                                    </Typography>
                                )}
                            </Box>


                            {/* Field action */}
                            <Tooltip
                                title={
                                    restricted
                                        ? "Pokaż pole"
                                        : "Ukryj pole"
                                }
                                placement="left"
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => toggleField(field)}
                                    aria-label={
                                        restricted
                                            ? `Pokaż ${headerName || field}`
                                            : `Ukryj ${headerName || field}`
                                    }
                                    sx={{
                                        color: restricted
                                            ? "error.main"
                                            : "primary.main",

                                        transition:
                                            "color 120ms ease, background-color 120ms ease",

                                        "&:hover": {
                                            bgcolor: restricted
                                                ? "error.main"
                                                : "primary.main",

                                            color: restricted
                                                ? "error.contrastText"
                                                : "primary.contrastText",
                                        },
                                    }}
                                >
                                    {restricted
                                        ? (
                                            <VisibilityOffOutlinedIcon
                                                fontSize="small"
                                            />
                                        )
                                        : (
                                            <VisibilityOutlinedIcon
                                                fontSize="small"
                                            />
                                        )
                                    }
                                </IconButton>
                            </Tooltip>
                        </Box>
                    );
                })}


                {/* Empty schema */}
                {schema.length === 0 && (
                    <Box sx={{ px: 2, py: 3 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                        >
                            Brak dostępnych pól
                        </Typography>
                    </Box>
                )}


                {/* Filter returned no rows */}
                {schema.length > 0 &&
                    visibleSchema.length === 0 && (
                        <Box sx={{ px: 2, py: 3 }}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                textAlign="center"
                            >
                                Brak ukrytych pól
                            </Typography>
                        </Box>
                    )
                }
            </Box>
        </Paper>
    );
};


export default FieldsAccessControl;