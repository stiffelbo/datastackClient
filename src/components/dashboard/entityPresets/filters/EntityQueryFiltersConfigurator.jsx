import React from "react";

import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";

import EntityQueryFilterRow from "./EntityQueryFilterRow";

import {
    createEntityFilter,
    getFilterField,
    getFilterId,
    normalizeEntityFilters,
    normalizeFilterableFields,
    removeEntityFilter,
    replaceEntityFilter,
} from "./entityQueryFilterUtils";

const EntityQueryFiltersConfigurator = ({
    fields = [],
    options = {},
    value = [],
    disabled = false,
    onChange = () => {},
}) => {
    const normalizedFields = normalizeFilterableFields(fields);
    const normalizedFilters = normalizeEntityFilters(value, normalizedFields);

    const hasFields = normalizedFields.length > 0;
    const hasFilters = normalizedFilters.length > 0;

    const handleAddFilter = () => {
        const field = normalizedFields[0];
        
        if (!field) {
            return;
        }
        
        const filter = createEntityFilter(field);
        console.log('add filter', field,filter );

        onChange([
            ...normalizedFilters,
            filter,
        ]);
    };

    const handleFilterChange = (filterId, nextFilter) => {
        onChange(
            replaceEntityFilter(
                normalizedFilters,
                filterId,
                nextFilter
            )
        );
    };

    const handleRemoveFilter = (filterId) => {
        onChange(
            removeEntityFilter(
                normalizedFilters,
                filterId
            )
        );
    };

    const handleClearFilters = () => {
        onChange([]);
    };

    const getFilterOptions = (filter) => {
        const field = getFilterField(
            normalizedFields,
            filter?.field
        );

        const fieldName = String(
            field?.name ??
            filter?.field ??
            ""
        ).trim();

        const fieldOptions = options?.[fieldName];

        return Array.isArray(fieldOptions)
            ? fieldOptions
            : [];
    };

    return (
        <Paper
            elevation={0}
            square
            sx={{
                width: "100%",
                minWidth: 0,
                bgcolor: "transparent",
            }}
        >
            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{
                    xs: "stretch",
                    sm: "center",
                }}
                sx={{
                    px: 1.5,
                    py: 1,
                }}
            >
                <Stack
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                >
                    <FilterAltOutlinedIcon
                        fontSize="small"
                        color="action"
                    />

                    <Typography
                        variant="subtitle2"
                        fontWeight={600}
                    >
                        Filtry
                    </Typography>

                    <Tooltip title="Liczba filtrów">
                        <Chip
                            size="small"
                            label={normalizedFilters.length}
                            variant="outlined"
                            sx={{
                                height: 20,
                                minWidth: 28,
                                "& .MuiChip-label": {
                                    px: 0.75,
                                    fontSize: "0.72rem",
                                },
                            }}
                        />
                    </Tooltip>
                </Stack>

                <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                >
                    <Button
                        size="small"
                        color="error"
                        variant="text"
                        startIcon={
                            <DeleteSweepOutlinedIcon fontSize="small" />
                        }
                        disabled={disabled || !hasFilters}
                        onClick={handleClearFilters}
                    >
                        Wyczyść
                    </Button>

                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                            <AddIcon fontSize="small" />
                        }
                        disabled={disabled || !hasFields}
                        onClick={handleAddFilter}
                    >
                        Dodaj filtr
                    </Button>
                </Stack>
            </Stack>

            <Divider />

            {!hasFields && (
                <Alert
                    severity="warning"
                    sx={{m: 1}}
                >
                    Schemat encji nie udostępnia pól, które można wykorzystać do filtrowania.
                </Alert>
            )}

            {hasFields && !hasFilters && (
                <Stack
                    spacing={1}
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        minHeight: 150,
                        px: 2,
                        py: 2.5,
                    }}
                >
                    <FilterAltOutlinedIcon
                        color="disabled"
                        sx={{fontSize: 36}}
                    />

                    <Typography
                        variant="body2"
                        fontWeight={600}
                    >
                        Brak filtrów
                    </Typography>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        textAlign="center"
                    >
                        Zapytanie zwróci wyniki bez ograniczania ich wartościami pól.
                    </Typography>

                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                            <AddIcon fontSize="small" />
                        }
                        disabled={disabled}
                        onClick={handleAddFilter}
                    >
                        Dodaj pierwszy filtr
                    </Button>
                </Stack>
            )}

            {hasFields && hasFilters && (
                <Stack divider={<Divider flexItem />}>
                    {normalizedFilters.map((filter, index) => {
                        const filterId = getFilterId(filter);

                        return (
                            <EntityQueryFilterRow
                                key={filterId}
                                index={index}
                                filter={filter}
                                fields={normalizedFields}
                                options={getFilterOptions(filter)}
                                disabled={disabled}
                                onChange={(nextFilter) => {
                                    handleFilterChange(filterId, nextFilter);
                                }}
                                onRemove={() => {
                                    handleRemoveFilter(filterId);
                                }}
                            />
                        );
                    })}
                </Stack>
            )}
        </Paper>
    );
};

export default EntityQueryFiltersConfigurator;