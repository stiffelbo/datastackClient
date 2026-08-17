import React from "react";

import {
    Alert,
    Box,
    Chip,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import EntityQueryMultiSelect
    from "./EntityQueryMultiSelect";

const OPERATORS_WITHOUT_VALUE = [
    "isEmpty",
    "notEmpty",
    "isTrue",
    "isFalse",
    "isPast",
    "isFuture",
];

const OPERATOR_LABELS = {
    multiSelect: "wybrane wartości",
    contains: "zawiera",
    equals: "równe",
    notEquals: "różne od",
    startsWith: "zaczyna się od",
    endsWith: "kończy się na",

    gt: "większe niż",
    gte: "większe lub równe",
    lt: "mniejsze niż",
    lte: "mniejsze lub równe",
    between: "pomiędzy",

    isPast: "data w przeszłości",
    isFuture: "data w przyszłości",

    isTrue: "tak",
    isFalse: "nie",

    isEmpty: "jest puste",
    notEmpty: "nie jest puste",
};

const EntityQueryFilterValue = ({
    filter = null,
    field = null,
    operator = "",
    options = [],
    value = null,

    disabled = false,
    readOnly = false,

    onChange = () => {},
}) => {
    const fieldType = String(
        field?.type ?? "string"
    ).toLowerCase();

    const normalizedOperator = String(
        operator ??
        filter?.op ??
        ""
    ).trim();

    const normalizedOptions = Array.isArray(options)
        ? options.filter(
            (option) =>
                option !== null &&
                option !== undefined
        )
        : [];

    const isOperatorWithoutValue =
        OPERATORS_WITHOUT_VALUE.includes(
            normalizedOperator
        );

    const isMultiSelect =
        normalizedOperator === "multiSelect";

    const isBetween =
        normalizedOperator === "between";

    const isNumberField = [
        "number",
        "integer",
        "float",
        "decimal",
    ].includes(fieldType);

    const isDateField = [
        "date",
        "datetime",
    ].includes(fieldType);

    const hasOptions =
        normalizedOptions.length > 0;

    const getOptionValue = (option) => {
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
            option.value ??
            option.id ??
            option.key ??
            ""
        );
    };

    const getOptionLabel = (option) => {
        if (
            option === null ||
            option === undefined
        ) {
            return "Brak wartości";
        }

        if (
            typeof option !== "object"
        ) {
            return String(option);
        }

        return String(
            option.label ??
            option.name ??
            option.title ??
            option.value ??
            option.id ??
            "Brak wartości"
        );
    };

    const resolveOptionLabel = (
        optionValue
    ) => {
        const option =
            normalizedOptions.find(
                (candidate) =>
                    String(
                        getOptionValue(
                            candidate
                        )
                    ) ===
                    String(optionValue)
            );

        if (option) {
            return getOptionLabel(option);
        }

        if (
            optionValue === null ||
            optionValue === undefined ||
            optionValue === ""
        ) {
            return "Brak wartości";
        }

        if (
            typeof optionValue === "boolean"
        ) {
            return optionValue
                ? "Tak"
                : "Nie";
        }

        if (
            typeof optionValue === "object"
        ) {
            return JSON.stringify(
                optionValue
            );
        }

        return String(optionValue);
    };

    const normalizeScalarValue = (
        currentValue
    ) => {
        if (
            currentValue === null ||
            currentValue === undefined
        ) {
            return "";
        }

        return currentValue;
    };

    const normalizeBetweenValue = (
        currentValue
    ) => {
        if (
            Array.isArray(currentValue)
        ) {
            return {
                min:
                    currentValue[0] ??
                    "",

                max:
                    currentValue[1] ??
                    "",
            };
        }

        if (
            currentValue &&
            typeof currentValue === "object"
        ) {
            return {
                min:
                    currentValue.min ??
                    currentValue.from ??
                    "",

                max:
                    currentValue.max ??
                    currentValue.to ??
                    "",
            };
        }

        return {
            min: "",
            max: "",
        };
    };

    const normalizeMultiSelectValue = (
        currentValue
    ) => {
        const include =
            Array.isArray(
                currentValue?.include
            )
                ? currentValue.include
                : [];

        const exclude =
            Array.isArray(
                currentValue?.exclude
            )
                ? currentValue.exclude
                : [];

        return {
            include,
            exclude,
        };
    };

    const emitChange = (
        nextValue
    ) => {
        if (
            disabled ||
            readOnly
        ) {
            return;
        }

        onChange(nextValue);
    };

    const handleTextChange = (
        event
    ) => {
        emitChange(
            event.target.value
        );
    };

    const handleNumberChange = (
        event
    ) => {
        const nextValue =
            event.target.value;

        emitChange(
            nextValue === ""
                ? ""
                : Number(nextValue)
        );
    };

    const handleSelectChange = (
        event
    ) => {
        emitChange(
            event.target.value
        );
    };

    const handleBetweenMinChange = (
        event
    ) => {
        const current =
            normalizeBetweenValue(
                value
            );

        const nextValue =
            event.target.value;

        emitChange({
            ...current,

            min:
                isNumberField &&
                nextValue !== ""
                    ? Number(nextValue)
                    : nextValue,
        });
    };

    const handleBetweenMaxChange = (
        event
    ) => {
        const current =
            normalizeBetweenValue(
                value
            );

        const nextValue =
            event.target.value;

        emitChange({
            ...current,

            max:
                isNumberField &&
                nextValue !== ""
                    ? Number(nextValue)
                    : nextValue,
        });
    };

    const getInputType = () => {
        if (isNumberField) {
            return "number";
        }

        if (isDateField) {
            return fieldType === "datetime"
                ? "datetime-local"
                : "date";
        }

        return "text";
    };

    const getInputLabel = () => {
        if (isDateField) {
            return "Data";
        }

        if (isNumberField) {
            return "Wartość";
        }

        return "Tekst";
    };

    const renderReadOnlyChipList = (
        values
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
                {values.map(
                    (
                        optionValue,
                        index
                    ) => (
                        <Chip
                            key={
                                String(
                                    optionValue
                                ) +
                                "-" +
                                index
                            }
                            size="small"
                            variant="outlined"
                            label={
                                resolveOptionLabel(
                                    optionValue
                                )
                            }
                        />
                    )
                )}
            </Stack>
        );
    };

    const renderReadOnlyMultiSelect = () => {
        const normalizedValue =
            normalizeMultiSelectValue(
                value
            );

        return (
            <Box
                sx={{
                    width: "100%",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        px: 1.25,
                        py: 1,
                    }}
                >
                    <Typography
                        variant="caption"
                        color="success.main"
                        fontWeight={700}
                    >
                        Uwzględnij
                    </Typography>

                    <Box sx={{ mt: 0.75 }}>
                        {renderReadOnlyChipList(
                            normalizedValue.include
                        )}
                    </Box>
                </Box>

                <Divider />

                <Box
                    sx={{
                        px: 1.25,
                        py: 1,
                    }}
                >
                    <Typography
                        variant="caption"
                        color="error.main"
                        fontWeight={700}
                    >
                        Wyklucz
                    </Typography>

                    <Box sx={{ mt: 0.75 }}>
                        {renderReadOnlyChipList(
                            normalizedValue.exclude
                        )}
                    </Box>
                </Box>
            </Box>
        );
    };

    const renderReadOnlyBetween = () => {
        const normalizedValue =
            normalizeBetweenValue(
                value
            );

        return (
            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={1}
            >
                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        Od
                    </Typography>

                    <Typography
                        variant="body2"
                        fontWeight={600}
                    >
                        {resolveOptionLabel(
                            normalizedValue.min
                        )}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        Do
                    </Typography>

                    <Typography
                        variant="body2"
                        fontWeight={600}
                    >
                        {resolveOptionLabel(
                            normalizedValue.max
                        )}
                    </Typography>
                </Box>
            </Stack>
        );
    };

    const renderReadOnlyScalar = () => {
        return (
            <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                    overflowWrap: "anywhere",
                }}
            >
                {resolveOptionLabel(value)}
            </Typography>
        );
    };

    const renderReadOnlyValue = () => {
        if (
            isOperatorWithoutValue
        ) {
            return (
                <Chip
                    size="small"
                    variant="outlined"
                    label={
                        OPERATOR_LABELS[
                            normalizedOperator
                        ] ??
                        normalizedOperator
                    }
                />
            );
        }

        if (isMultiSelect) {
            return renderReadOnlyMultiSelect();
        }

        if (isBetween) {
            return renderReadOnlyBetween();
        }

        return renderReadOnlyScalar();
    };

    const renderMultiSelect = () => {
        return (
            <EntityQueryMultiSelect
                options={
                    normalizedOptions
                }
                value={value}
                disabled={disabled}
                onChange={emitChange}
            />
        );
    };

    const renderBetweenInputs = () => {
        const normalizedValue =
            normalizeBetweenValue(
                value
            );

        return (
            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={1}
                sx={{
                    width: "100%",
                }}
            >
                <TextField
                    fullWidth
                    size="small"
                    type={getInputType()}
                    label="Od"
                    value={
                        normalizedValue.min
                    }
                    disabled={disabled}
                    onChange={
                        handleBetweenMinChange
                    }
                    slotProps={{
                        inputLabel: {
                            shrink: isDateField,
                        },
                    }}
                />

                <TextField
                    fullWidth
                    size="small"
                    type={getInputType()}
                    label="Do"
                    value={
                        normalizedValue.max
                    }
                    disabled={disabled}
                    onChange={
                        handleBetweenMaxChange
                    }
                    slotProps={{
                        inputLabel: {
                            shrink: isDateField,
                        },
                    }}
                />
            </Stack>
        );
    };

    const renderOptionsSelect = () => {
        return (
            <FormControl
                fullWidth
                size="small"
                disabled={disabled}
            >
                <InputLabel>
                    Wartość
                </InputLabel>

                <Select
                    value={
                        normalizeScalarValue(
                            value
                        )
                    }
                    label="Wartość"
                    onChange={
                        handleSelectChange
                    }
                >
                    {normalizedOptions.map(
                        (
                            option,
                            index
                        ) => (
                            <MenuItem
                                key={
                                    String(
                                        getOptionValue(
                                            option
                                        )
                                    ) +
                                    "-" +
                                    index
                                }
                                value={
                                    getOptionValue(
                                        option
                                    )
                                }
                                disabled={
                                    Boolean(
                                        option
                                            ?.disabled
                                    )
                                }
                            >
                                {getOptionLabel(
                                    option
                                )}
                            </MenuItem>
                        )
                    )}
                </Select>
            </FormControl>
        );
    };

    const renderScalarInput = () => {
        return (
            <TextField
                fullWidth
                size="small"
                type={getInputType()}
                label={getInputLabel()}
                value={
                    normalizeScalarValue(
                        value
                    )
                }
                disabled={disabled}
                onChange={
                    isNumberField
                        ? handleNumberChange
                        : handleTextChange
                }
                slotProps={{
                    inputLabel: {
                        shrink: true,
                    },
                }}
            />
        );
    };

    const renderOperatorWithoutValue = () => {
        return (
            <Alert
                severity="info"
                icon={false}
                sx={{
                    py: 0,
                }}
            >
                {OPERATOR_LABELS[
                    normalizedOperator
                ] ??
                    "Operator nie wymaga wartości"}
            </Alert>
        );
    };

    const renderEditor = () => {
        if (!field) {
            return (
                <Alert
                    severity="info"
                    icon={false}
                >
                    Wybierz pole filtra.
                </Alert>
            );
        }

        if (
            normalizedOperator === ""
        ) {
            return (
                <Alert
                    severity="info"
                    icon={false}
                >
                    Wybierz operator.
                </Alert>
            );
        }

        if (
            isOperatorWithoutValue
        ) {
            return renderOperatorWithoutValue();
        }

        if (isMultiSelect) {
            return renderMultiSelect();
        }

        if (isBetween) {
            return renderBetweenInputs();
        }

        return renderScalarInput();
    };

    return (
        <Stack
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >
            {readOnly
                ? renderReadOnlyValue()
                : renderEditor()}
        </Stack>
    );
};

export default EntityQueryFilterValue;