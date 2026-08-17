import React, { useState } from "react";

import {
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Popover,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";

import FilterAltOutlinedIcon
    from "@mui/icons-material/FilterAltOutlined";

import CloseOutlinedIcon
    from "@mui/icons-material/CloseOutlined";

import LinkOffOutlinedIcon
    from "@mui/icons-material/LinkOffOutlined";

import ArrowUpwardOutlinedIcon
    from "@mui/icons-material/ArrowUpwardOutlined";

import ArrowDownwardOutlinedIcon
    from "@mui/icons-material/ArrowDownwardOutlined";

const EMPTY_VALUE_LABEL = "Brak wartości";

const EntityQueryActiveStoredPreset = ({
    activePreset = null,

    filterableFields = [],
    filterOptions = {},

    clearing = false,

    onClear = async () => {},
}) => {
    const [anchorElement, setAnchorElement] =
        useState(null);

    const state =
        activePreset?.state ?? {};

    const filters =
        Array.isArray(state?.filters)
            ? state.filters
            : [];

    const sort =
        state?.sort &&
        typeof state.sort === "object"
            ? state.sort
            : null;

    const limit =
        state?.limit ?? null;

    const open =
        Boolean(anchorElement);

    const handleOpen = (event) => {
        setAnchorElement(
            event.currentTarget
        );
    };

    const handleClose = () => {
        setAnchorElement(null);
    };

    const handleClear = async () => {
        await onClear();
        handleClose();
    };

    const getFieldDefinition = (
        fieldName
    ) => {
        return (
            filterableFields.find(
                (field) => {
                    const value =
                        field?.field ??
                        field?.name ??
                        field?.value ??
                        field?.key;

                    return (
                        String(value) ===
                        String(fieldName)
                    );
                }
            ) ?? null
        );
    };

    const getFieldLabel = (
        fieldName
    ) => {
        const definition =
            getFieldDefinition(
                fieldName
            );

        return String(
            definition?.label ??
            definition?.title ??
            definition?.name ??
            fieldName ??
            "Nieznane pole"
        );
    };

    const getOperatorLabel = (
        operator
    ) => {
        const labels = {
            eq: "równe",
            neq: "różne od",
            in: "zawiera",
            not_in: "nie zawiera",
            contains: "zawiera tekst",
            not_contains: "nie zawiera tekstu",
            starts_with: "zaczyna się od",
            ends_with: "kończy się na",
            gt: "większe niż",
            gte: "większe lub równe",
            lt: "mniejsze niż",
            lte: "mniejsze lub równe",
            between: "pomiędzy",
            is_null: "jest puste",
            is_not_null: "nie jest puste",
        };

        return (
            labels[operator] ??
            operator ??
            "brak operatora"
        );
    };

    const getFieldOptions = (
        fieldName
    ) => {
        const options =
            filterOptions?.[fieldName];

        return Array.isArray(options)
            ? options
            : [];
    };

    const getOptionValue = (
        option
    ) => {
        if (
            option === null ||
            option === undefined
        ) {
            return option;
        }

        if (
            typeof option !== "object"
        ) {
            return option;
        }

        return (
            option?.value ??
            option?.id ??
            option?.key ??
            option?.name ??
            option?.label
        );
    };

    const getOptionLabel = (
        option
    ) => {
        if (
            option === null ||
            option === undefined
        ) {
            return EMPTY_VALUE_LABEL;
        }

        if (
            typeof option !== "object"
        ) {
            return String(option);
        }

        return String(
            option?.label ??
            option?.name ??
            option?.title ??
            option?.value ??
            option?.id ??
            EMPTY_VALUE_LABEL
        );
    };

    const resolveValueLabel = (
        fieldName,
        value
    ) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return EMPTY_VALUE_LABEL;
        }

        if (
            typeof value === "boolean"
        ) {
            return value
                ? "Tak"
                : "Nie";
        }

        const options =
            getFieldOptions(
                fieldName
            );

        const matchingOption =
            options.find(
                (option) => {
                    return (
                        String(
                            getOptionValue(
                                option
                            )
                        ) ===
                        String(value)
                    );
                }
            );

        if (matchingOption) {
            return getOptionLabel(
                matchingOption
            );
        }

        if (
            typeof value === "object"
        ) {
            return JSON.stringify(
                value
            );
        }

        return String(value);
    };

    const renderValueChip = (
        fieldName,
        value,
        chipProps = {}
    ) => {
        return (
            <Chip
                key={`${fieldName}-${String(value)}`}
                size="small"
                label={resolveValueLabel(
                    fieldName,
                    value
                )}
                {...chipProps}
            />
        );
    };

    const renderValueList = (
        fieldName,
        values,
        chipProps = {}
    ) => {
        if (
            !Array.isArray(values) ||
            values.length === 0
        ) {
            return (
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Brak
                </Typography>
            );
        }

        return (
            <Stack
                direction="row"
                spacing={0.75}
                useFlexGap
                flexWrap="wrap"
            >
                {values.map((value) => {
                    return renderValueChip(
                        fieldName,
                        value,
                        chipProps
                    );
                })}
            </Stack>
        );
    };

    const renderIncludeExcludeValue = (
        fieldName,
        value
    ) => {
        const include =
            Array.isArray(value?.include)
                ? value.include
                : [];

        const exclude =
            Array.isArray(value?.exclude)
                ? value.exclude
                : [];

        return (
            <Stack spacing={1}>
                {include.length > 0 && (
                    <Box>
                        <Typography
                            variant="caption"
                            color="success.main"
                            sx={{
                                display: "block",
                                mb: 0.5,
                                fontWeight: 600,
                            }}
                        >
                            Uwzględnij
                        </Typography>

                        {renderValueList(
                            fieldName,
                            include,
                            {
                                color: "success",
                                variant: "outlined",
                            }
                        )}
                    </Box>
                )}

                {exclude.length > 0 && (
                    <Box>
                        <Typography
                            variant="caption"
                            color="error.main"
                            sx={{
                                display: "block",
                                mb: 0.5,
                                fontWeight: 600,
                            }}
                        >
                            Wyklucz
                        </Typography>

                        {renderValueList(
                            fieldName,
                            exclude,
                            {
                                color: "error",
                                variant: "outlined",
                            }
                        )}
                    </Box>
                )}

                {include.length === 0 &&
                    exclude.length === 0 && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Brak wybranych wartości
                        </Typography>
                    )}
            </Stack>
        );
    };

    const renderBetweenValue = (
        fieldName,
        value
    ) => {
        let from = null;
        let to = null;

        if (Array.isArray(value)) {
            [from, to] = value;
        } else if (
            value &&
            typeof value === "object"
        ) {
            from =
                value?.from ??
                value?.min ??
                value?.start ??
                null;

            to =
                value?.to ??
                value?.max ??
                value?.end ??
                null;
        }

        return (
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
            >
                <Chip
                    size="small"
                    variant="outlined"
                    label={`Od: ${resolveValueLabel(
                        fieldName,
                        from
                    )}`}
                />

                <Chip
                    size="small"
                    variant="outlined"
                    label={`Do: ${resolveValueLabel(
                        fieldName,
                        to
                    )}`}
                />
            </Stack>
        );
    };

    const renderArrayValue = (
        fieldName,
        value
    ) => {
        return renderValueList(
            fieldName,
            value,
            {
                variant: "outlined",
            }
        );
    };

    const renderScalarValue = (
        fieldName,
        value
    ) => {
        return (
            <Typography
                variant="body2"
                sx={{
                    overflowWrap: "anywhere",
                }}
            >
                {resolveValueLabel(
                    fieldName,
                    value
                )}
            </Typography>
        );
    };

    const renderFilterValue = (
        filter
    ) => {
        const fieldName =
            filter?.field;

        const operator =
            filter?.operator;

        const value =
            filter?.value;

        if (
            operator === "is_null" ||
            operator === "is_not_null"
        ) {
            return (
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Operator nie wymaga wartości
                </Typography>
            );
        }

        if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            (
                Array.isArray(
                    value?.include
                ) ||
                Array.isArray(
                    value?.exclude
                )
            )
        ) {
            return renderIncludeExcludeValue(
                fieldName,
                value
            );
        }

        if (
            operator === "between"
        ) {
            return renderBetweenValue(
                fieldName,
                value
            );
        }

        if (Array.isArray(value)) {
            return renderArrayValue(
                fieldName,
                value
            );
        }

        return renderScalarValue(
            fieldName,
            value
        );
    };

    const renderFilter = (
        filter,
        index
    ) => {
        const fieldName =
            filter?.field;

        const operator =
            filter?.operator;

        return (
            <Paper
                key={
                    filter?.id ??
                    `${fieldName}-${operator}-${index}`
                }
                variant="outlined"
                sx={{
                    p: 1.25,
                }}
            >
                <Stack spacing={1}>
                    <Box>
                        <Typography
                            variant="body2"
                            fontWeight={600}
                        >
                            {getFieldLabel(
                                fieldName
                            )}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {getOperatorLabel(
                                operator
                            )}
                        </Typography>
                    </Box>

                    {renderFilterValue(
                        filter
                    )}
                </Stack>
            </Paper>
        );
    };

    const renderFilters = () => {
        if (filters.length === 0) {
            return (
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Ten preset nie zawiera filtrów.
                </Typography>
            );
        }

        return (
            <Stack spacing={1}>
                {filters.map(
                    renderFilter
                )}
            </Stack>
        );
    };

    if (!activePreset) {
        return null;
    }

    const presetName =
        String(
            activePreset?.name ??
            "Bez nazwy"
        );

    const description =
        String(
            activePreset?.description ??
            ""
        ).trim();

    const filtersCount =
        filters.length;

    return (
        <>
            <Tooltip
                title={
                    description ||
                    "Pokaż ustawienia aktywnego presetu"
                }
            >
                <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    startIcon={
                        <FilterAltOutlinedIcon />
                    }
                    onClick={handleOpen}
                    sx={{
                        maxWidth: 320,
                        justifyContent: "flex-start",
                        textTransform: "none",
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Aktywny preset:{" "}
                        <strong>
                            {presetName}
                        </strong>
                    </Box>
                </Button>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchorElement}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                slotProps={{
                    paper: {
                        sx: {
                            width: 420,
                            maxWidth:
                                "calc(100vw - 24px)",
                            maxHeight:
                                "min(720px, calc(100vh - 48px))",
                            overflow: "hidden",
                        },
                    },
                }}
            >
                <Stack
                    sx={{
                        height: "100%",
                        minHeight: 0,
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                        sx={{
                            px: 2,
                            py: 1.5,
                        }}
                    >
                        <Box
                            sx={{
                                flex: 1,
                                minWidth: 0,
                            }}
                        >
                            <Typography
                                variant="overline"
                                color="text.secondary"
                            >
                                Aktywny preset
                            </Typography>

                            <Typography
                                variant="subtitle1"
                                fontWeight={700}
                                sx={{
                                    overflowWrap:
                                        "anywhere",
                                }}
                            >
                                {presetName}
                            </Typography>

                            {description && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 0.5,
                                        whiteSpace:
                                            "pre-wrap",
                                    }}
                                >
                                    {description}
                                </Typography>
                            )}
                        </Box>

                        <IconButton
                            size="small"
                            onClick={handleClose}
                            aria-label="Zamknij"
                        >
                            <CloseOutlinedIcon
                                fontSize="small"
                            />
                        </IconButton>
                    </Stack>

                    <Divider />

                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflow: "auto",
                            px: 2,
                            py: 1.5,
                        }}
                    >
                        <Stack spacing={2}>
                            <Box>
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{
                                        mb: 1,
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight={700}
                                    >
                                        Filtry
                                    </Typography>

                                    <Chip
                                        size="small"
                                        label={
                                            filtersCount
                                        }
                                    />
                                </Stack>

                                {renderFilters()}
                            </Box>
                        </Stack>
                    </Box>

                    <Divider />

                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                        sx={{
                            px: 2,
                            py: 1.25,
                        }}
                    >
                        <Button
                            type="button"
                            color="inherit"
                            startIcon={
                                <LinkOffOutlinedIcon />
                            }
                            disabled={clearing}
                            onClick={handleClear}
                        >
                            {clearing
                                ? "Odłączanie..."
                                : "Odłącz preset"}
                        </Button>
                    </Stack>
                </Stack>
            </Popover>
        </>
    );
};

export default EntityQueryActiveStoredPreset;