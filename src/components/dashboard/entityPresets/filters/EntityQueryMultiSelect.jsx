import React from "react";

import {
    Box,
    Chip,
    Divider,
    IconButton,
    ListItemText,
    MenuItem,
    Select,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ClearAllOutlinedIcon from "@mui/icons-material/ClearAllOutlined";

import {
    normalizeMultiSelectFilterValue,
} from "./entityQueryFilterUtils";

const GROUP_INCLUDE = "include";
const GROUP_EXCLUDE = "exclude";
const GROUP_NEUTRAL = "neutral";

const getOptionValue = (option) => {
    if (option === null || option === undefined) {
        return "";
    }

    if (typeof option !== "object") {
        return option;
    }

    return option.value ?? option.id ?? option.key ?? "";
};

const getOptionLabel = (option) => {
    if (option === null || option === undefined) {
        return "";
    }

    if (typeof option !== "object") {
        return String(option);
    }

    return String(
        option.label ??
        option.name ??
        option.title ??
        option.value ??
        option.id ??
        option.key ??
        ""
    );
};

const EntityQueryMultiSelect = ({
    options = [],
    value = null,
    label = "Wartości",
    disabled = false,
    onChange = () => { },
}) => {
    const normalizedOptions = Array.isArray(options)
        ? options.filter((option) => option !== null && option !== undefined)
        : [];

    const normalizedValue = normalizeMultiSelectFilterValue(value);
    const include = normalizedValue.include;
    const exclude = normalizedValue.exclude;

    const hasSelection = include.length > 0 || exclude.length > 0;

    const isIncluded = (optionValue) => {
        return include.includes(optionValue);
    };

    const isExcluded = (optionValue) => {
        return exclude.includes(optionValue);
    };

    const emitChange = (nextInclude, nextExclude) => {
        onChange(
            normalizeMultiSelectFilterValue({
                include: nextInclude,
                exclude: nextExclude,
            })
        );
    };

    const toggleInclude = (optionValue) => {
        const nextInclude = isIncluded(optionValue)
            ? include.filter((currentValue) => currentValue !== optionValue)
            : [...include, optionValue];

        const nextExclude = exclude.filter((currentValue) => currentValue !== optionValue);

        emitChange(nextInclude, nextExclude);
    };

    const toggleExclude = (optionValue) => {
        const nextExclude = isExcluded(optionValue)
            ? exclude.filter((currentValue) => currentValue !== optionValue)
            : [...exclude, optionValue];

        const nextInclude = include.filter((currentValue) => currentValue !== optionValue);

        emitChange(nextInclude, nextExclude);
    };

    const handleClear = (event) => {
        event.stopPropagation();
        emitChange([], []);
    };

    const includedOptions = normalizedOptions.filter((option) => {
        return isIncluded(getOptionValue(option));
    });

    const excludedOptions = normalizedOptions.filter((option) => {
        const optionValue = getOptionValue(option);

        return isExcluded(optionValue) && !isIncluded(optionValue);
    });

    const neutralOptions = normalizedOptions.filter((option) => {
        const optionValue = getOptionValue(option);

        return !isIncluded(optionValue) && !isExcluded(optionValue);
    });

    const groups = [
        {
            key: GROUP_INCLUDE,
            label: "Uwzględnione",
            options: includedOptions,
        },
        {
            key: GROUP_EXCLUDE,
            label: "Wykluczone",
            options: excludedOptions,
        },
        {
            key: GROUP_NEUTRAL,
            label: "Pozostałe",
            options: neutralOptions,
        },
    ].filter((group) => group.options.length > 0);

    const getGroupColor = (groupKey) => {
        if (groupKey === GROUP_INCLUDE) {
            return "primary.main";
        }

        if (groupKey === GROUP_EXCLUDE) {
            return "error.main";
        }

        return "text.secondary";
    };

    const renderValue = () => {
        if (!hasSelection) {
            return (
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Wybierz wartości
                </Typography>
            );
        }

        return (
            <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
            >
                {include.length > 0 && (
                    <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={`Uwzględnij: ${include.length}`}
                        sx={{ height: 22 }}
                    />
                )}

                {exclude.length > 0 && (
                    <Chip
                        size="small"
                        color="error"
                        variant="outlined"
                        label={`Wyklucz: ${exclude.length}`}
                        sx={{ height: 22 }}
                    />
                )}
            </Stack>
        );
    };

    const renderOption = (option, index, groupKey) => {
        const optionValue = getOptionValue(option);
        const optionLabel = getOptionLabel(option);

        return (
            <MenuItem
                key={`${groupKey}-${String(optionValue)}-${index}`}
                value=""
                disableRipple
                sx={{
                    py: 0.25,
                    px: 0.75,
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                        width: "100%",
                        minWidth: 0,
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={0.25}
                        alignItems="center"
                        sx={{
                            flexShrink: 0,
                        }}
                    >

                        <IconButton
                            size="small"
                            color={isIncluded(optionValue) ? "primary" : "default"}
                            disabled={disabled}
                            onClick={(event) => {
                                event.stopPropagation();
                                toggleInclude(optionValue);
                            }}
                        >
                            <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>


                        <IconButton
                            size="small"
                            color={isExcluded(optionValue) ? "error" : "default"}
                            disabled={disabled}
                            onClick={(event) => {
                                event.stopPropagation();
                                toggleExclude(optionValue);
                            }}
                        >
                            <RemoveCircleOutlineIcon fontSize="small" />
                        </IconButton>

                    </Stack>

                    <ListItemText
                        primary={optionLabel}
                        secondary={
                            typeof option === "object"
                                ? option.description ?? option.subtitle ?? null
                                : null
                        }
                        primaryTypographyProps={{
                            variant: "body2",
                            noWrap: true,
                        }}
                        secondaryTypographyProps={{
                            variant: "caption",
                            noWrap: true,
                        }}
                    />
                </Stack>
            </MenuItem>
        );
    };

    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >
            <Select
                fullWidth
                multiple
                size="small"
                label={label}
                value={[]}
                disabled={disabled}
                displayEmpty
                renderValue={renderValue}
                MenuProps={{
                    PaperProps: {
                        sx: {
                            maxHeight: 500,
                            minWidth: 340,
                        },
                    },
                }}
            >
                <MenuItem
                    disableRipple
                    sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        bgcolor: "background.paper",
                        py: 0.5,
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            width: "100%",
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Dodaj do uwzględnionych lub wykluczonych
                        </Typography>

                        <Tooltip title="Wyczyść wybór">
                            <span>
                                <IconButton
                                    size="small"
                                    color="error"
                                    disabled={disabled || !hasSelection}
                                    onClick={handleClear}
                                    aria-label="Wyczyść wybór"
                                >
                                    <ClearAllOutlinedIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                </MenuItem>

                <Divider />

                {groups.map((group, groupIndex) => {
                    return (
                        <Box key={group.key}>
                            {groupIndex > 0 && <Divider />}

                            <MenuItem
                                disabled
                                sx={{
                                    minHeight: 28,
                                    py: 0.25,
                                    opacity: 1,
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    fontWeight={700}
                                    color={getGroupColor(group.key)}
                                >
                                    {group.label}
                                </Typography>
                            </MenuItem>

                            {group.options.map((option, index) => {
                                return renderOption(option, index, group.key);
                            })}
                        </Box>
                    );
                })}

                {normalizedOptions.length === 0 && (
                    <MenuItem disabled>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Brak dostępnych wartości
                        </Typography>
                    </MenuItem>
                )}
            </Select>
        </Box>
    );
};

export default EntityQueryMultiSelect;