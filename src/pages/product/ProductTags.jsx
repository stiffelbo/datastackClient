import React, { useMemo } from "react";

import {
    Autocomplete,
    Box,
    Chip,
    TextField,
    Tooltip,
} from "@mui/material";


const getContrastColor = (hex) => {
    if (!hex || typeof hex !== "string") {
        return undefined;
    }

    const color = hex.replace("#", "");

    if (color.length !== 6) {
        return undefined;
    }

    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    const luminance = (r * 299 + g * 587 + b * 114) / 1000;

    return luminance > 160 ? "#111" : "#fff";
};


const ProductTags = ({
    value = "",
    options = [],
    onChange,
    disabled = false,
    compact = false,
    maxVisible = 3,
}) => {

    const selectedLabels = useMemo(() => {
        return String(value ?? "")
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);
    }, [value]);


    const selectedOptions = useMemo(() => {
        return selectedLabels.map(label => {
            const option = options.find(
                item => item.label === label
            );

            // Zachowujemy również stare tagi,
            // których nie ma już w aktualnych definicjach.
            return option ?? {
                value: null,
                label,
                title: null,
                disabled: false,
                group: null,
                description: null,
            };
        });
    }, [selectedLabels, options]);

    const emitChange = (items) => {
        const csv = items
            .map(item => item.label)
            .filter(Boolean)
            .join(",");

        onChange?.(csv);
    };


    const renderChip = (option, removable = false) => {
        const backgroundColor = option.title || undefined;
        const color = getContrastColor(backgroundColor);

        const chip = (
            <Chip
                key={option.value}
                label={option.label}
                size="small"
                onDelete={
                    removable && !disabled
                        ? () => {
                            emitChange(
                                selectedOptions.filter(
                                    (item) =>
                                        Number(item.value) !==
                                        Number(option.value)
                                )
                            );
                        }
                        : undefined
                }
                sx={{
                    height: compact ? 22 : 26,
                    backgroundColor,
                    color,

                    "& .MuiChip-label": {
                        px: compact ? 0.8 : 1.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    },

                    "& .MuiChip-deleteIcon": {
                        color: "inherit",
                        opacity: 0.7,

                        "&:hover": {
                            color: "inherit",
                            opacity: 1,
                        },
                    },
                }}
            />
        );

        if (!option.description && !option.title) {
            return chip;
        }

        return (
            <Tooltip
                key={option.value}
                title={option.description || option.label}
                arrow
            >
                {chip}
            </Tooltip>
        );
    };


    /**
     * Widok do tabeli.
     */
    if (compact) {
        const visible = selectedOptions.slice(0, maxVisible);
        const hiddenCount =
            selectedOptions.length - visible.length;

        if (selectedOptions.length === 0) {
            return null;
        }

        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "center",
                    alignContent: "flex-start",
                    gap: 0.5,
                    width: "100%",
                    py: 0.5,
                }}
            >
                {selectedOptions.map((option) =>
                    renderChip(option)
                )}
            </Box>
        );
    }


    /**
     * Pełny widok edycyjny.
     */
    return (
        <Box
            sx={{
                width: "100%",
            }}
        >
            <Autocomplete
                multiple
                disableCloseOnSelect
                disabled={disabled}
                options={options}
                value={selectedOptions}

                isOptionEqualToValue={(option, selected) =>
                    Number(option.value) ===
                    Number(selected.value)
                }

                getOptionLabel={(option) =>
                    option.label ?? ""
                }

                getOptionDisabled={(option) =>
                    Boolean(option.disabled)
                }

                onChange={(event, newValue) => {
                    emitChange(newValue);
                }}

                renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => {
                        const backgroundColor =
                            option.title || undefined;

                        const color =
                            getContrastColor(backgroundColor);

                        const tagProps = getTagProps({
                            index,
                        });

                        return (
                            <Chip
                                {...tagProps}
                                key={option.value}
                                label={option.label}
                                size="small"
                                sx={{
                                    backgroundColor,
                                    color,

                                    "& .MuiChip-deleteIcon": {
                                        color: "inherit",
                                        opacity: 0.7,

                                        "&:hover": {
                                            color: "inherit",
                                            opacity: 1,
                                        },
                                    },
                                }}
                            />
                        );
                    })
                }

                renderOption={(props, option) => (
                    <Box
                        component="li"
                        {...props}
                        key={option.value}
                        sx={{
                            display: "flex !important",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <Box
                            sx={{
                                width: 10,
                                height: 10,
                                flexShrink: 0,
                                borderRadius: "50%",
                                backgroundColor:
                                    option.title ||
                                    "text.disabled",
                            }}
                        />

                        <Box
                            sx={{
                                minWidth: 0,
                            }}
                        >
                            {option.label}
                        </Box>
                    </Box>
                )}

                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Tagi"
                        placeholder={
                            selectedOptions.length
                                ? "Dodaj..."
                                : "Dodaj tagi..."
                        }
                        variant="standard"
                    />
                )}

                noOptionsText="Brak tagów do wyboru"
            />
        </Box>
    );
};


export default ProductTags;