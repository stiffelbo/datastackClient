import React from "react";

import {
    Box,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import EntityQueryFilterValue from "./EntityQueryFilterValue";

import {
    changeEntityFilterField,
    changeEntityFilterOperator,
    changeEntityFilterValue,
    getFilterField,
    getFilterFieldLabel,
    getFilterFieldName,
    getFilterFieldOperators,
    getFilterOperatorLabel,
    normalizeFilterOperator,
} from "./entityQueryFilterUtils";

const EntityQueryFilterRow = ({
    index = 0,
    filter = null,
    fields = [],
    options = [],
    disabled = false,
    onChange = () => { },
    onRemove = () => { },
}) => {
    const field = getFilterField(fields, filter?.field);
    const operators = getFilterFieldOperators(field);

    const handleFieldChange = (event) => {
        const nextField = getFilterField(fields, event.target.value);

        if (!nextField) {
            return;
        }

        onChange(changeEntityFilterField(filter, nextField));
    };

    const handleOperatorChange = (event) => {
        onChange(
            changeEntityFilterOperator(
                filter,
                event.target.value
            )
        );
    };

    const handleValueChange = (value) => {
        onChange(
            changeEntityFilterValue(
                filter,
                value
            )
        );
    };

    return (
        <Box
            component="article"
            aria-label={`Konfiguracja filtra ${index + 1}`}
            sx={{
                minWidth: 0,
            }}
        >
            <Stack
                direction={{
                    xs: "column",
                    md: "row",
                }}
                spacing={1}
                alignItems={{
                    xs: "stretch",
                    md: "center",
                }}
                sx={{
                    minWidth: 0,
                    px: 1,
                    py: 0.75,
                }}
            >
                <Tooltip title={`Filtr numer ${index + 1}`}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            minWidth: 22,
                            textAlign: "center",
                            fontWeight: 600,
                            flexShrink: 0,
                        }}
                    >
                        {index + 1}
                    </Typography>
                </Tooltip>

                <FormControl
                    size="small"
                    sx={{
                        minWidth: 180,
                        flex: "1 1 220px",
                    }}
                >
                    <InputLabel id={`filter-field-${filter?.id}`}>
                        Pole
                    </InputLabel>

                    <Select
                        labelId={`filter-field-${filter?.id}`}
                        value={filter?.field ?? ""}
                        label="Pole"
                        disabled={disabled}
                        onChange={handleFieldChange}
                    >
                        {fields.map((fieldSchema) => {
                            const fieldName = getFilterFieldName(fieldSchema);

                            return (
                                <MenuItem
                                    key={fieldName}
                                    value={fieldName}
                                >
                                    {getFilterFieldLabel(fieldSchema)}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>

                <FormControl
                    size="small"
                    sx={{
                        minWidth: 160,
                        flex: "0 1 190px",
                    }}
                >
                    <InputLabel id={`filter-operator-${filter?.id}`}>
                        Operator
                    </InputLabel>

                    <Select
                        labelId={`filter-operator-${filter?.id}`}
                        value={filter?.op ?? ""}
                        label="Operator"
                        disabled={disabled || !field}
                        onChange={handleOperatorChange}
                    >
                        {operators.map((operator) => {
                            const operatorValue = normalizeFilterOperator(operator);

                            return (
                                <MenuItem
                                    key={operatorValue}
                                    value={operatorValue}
                                >
                                    {getFilterOperatorLabel(operator)}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>

                <Box
                    sx={{
                        minWidth: 180,
                        flex: "2 1 320px",
                    }}
                >
                    <EntityQueryFilterValue
                        filter={filter}
                        field={field}
                        operator={filter?.op}
                        options={options}
                        value={filter?.value}
                        disabled={disabled}
                        readOnly={false}
                        onChange={handleValueChange}
                    />
                </Box>

                <Tooltip title="Usuń filtr">
                    <span>
                        <IconButton
                            size="small"
                            color="error"
                            disabled={disabled}
                            onClick={onRemove}
                            aria-label="Usuń filtr"
                            sx={{
                                flexShrink: 0,
                            }}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            </Stack>
        </Box>
    );
};

export default EntityQueryFilterRow;