import React, { useMemo } from "react";

import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    ListSubheader,
    MenuItem,
    Select,
    Switch,
    TextField,
} from "@mui/material";

import { useForm } from "../../components/powerTable/form/useForm";
import { normalizeSchema } from "../../components/powerTable/form/schemaUtils";
import validatorDefault from "../../components/powerTable/form/validator";
import {
    normalizeOptions,
    normalizeDateInputValue,
    normalizeDateTimeLocalInputValue,
} from "../../components/powerTable/form/utils";

import ProductTags from "./ProductTags";

const ProductForm = ({
    id,
    schema,
    data,
    onSubmit,
    loading,
    entity
}) => {

    const formSchema = useMemo(() => {
        return normalizeSchema(schema);
    }, [schema]);


    const form = useForm({
        data,
        schema: formSchema,
        mode: "edit",
        validator: validatorDefault,

        onSubmit: async (data) => {
            return await onSubmit(id, data);
        },

        sendFormData: false,
        addons: null,
    });


    /**
     * Renderowanie opcji select.
     * Obsługuje również grupowanie po option.group.
     */
    const renderSelectOptions = (options = []) => {
        const result = [];
        let currentGroup = null;

        options.forEach((option) => {
            const group = option.group ?? null;

            if (group && group !== currentGroup) {
                result.push(
                    <ListSubheader
                        key={`group-${group}`}
                        disableSticky
                    >
                        {group}
                    </ListSubheader>
                );

                currentGroup = group;
            }

            if (!group) {
                currentGroup = null;
            }

            result.push(
                <MenuItem
                    key={`option-${String(option.value)}`}
                    value={option.value ?? ""}
                    disabled={Boolean(option.disabled)}
                    title={
                        option.title ??
                        option.description ??
                        undefined
                    }
                >
                    {option.label}
                </MenuItem>
            );
        });

        return result;
    };


    /**
     * Renderer pola.
     *
     * Typ, label, disabled, required i options pochodzą ze schema.
     * Położenie pola NIE pochodzi ze schema.
     */
    const renderInput = (name, overrides = {}) => {
        const field = form.getField(name);

        if (!field || field.type === "hidden") {
            return null;
        }

        const config = {
            ...field,
            ...overrides,
        };

        const value = form.formState?.[name];
        const errorText = form.getErrorText?.(name) ?? "";

        const commonProps = {
            fullWidth: true,
            size: "small",
            variant: "standard",
            label: config.label ?? name,
            disabled: Boolean(config.disabled),
            required: Boolean(config.required),
            error: Boolean(errorText),
            helperText: errorText || config.description || "",
            placeholder: config.placeholder,
        };


        switch (config.type) {

            case "textarea":
                return (
                    <TextField
                        {...commonProps}
                        multiline
                        minRows={config.rows ?? 4}
                        value={value ?? ""}
                        onChange={(event) => {
                            form.setField(
                                name,
                                event.target.value
                            );
                        }}
                    />
                );


            case "number":
                return (
                    <TextField
                        {...commonProps}
                        type="number"
                        value={value ?? ""}
                        inputProps={{
                            step: config.step,
                        }}
                        onChange={(event) => {
                            form.setField(
                                name,
                                event.target.value
                            );
                        }}
                    />
                );


            case "date":
            case "datetime":
            case "datetime-local":
                return (
                    <TextField
                        {...commonProps}
                        type={
                            config.type === "datetime"
                                ? "datetime-local"
                                : config.type
                        }
                        value={value ?? ""}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        onChange={(event) => {
                            form.setField(
                                name,
                                event.target.value || null
                            );
                        }}
                    />
                );


            case "select":
            case "select-object":
                return (
                    <FormControl
                        fullWidth
                        size="small"
                        variant="standard"
                        disabled={Boolean(config.disabled)}
                        required={Boolean(config.required)}
                        error={Boolean(errorText)}
                    >
                        <InputLabel id={`${name}-label`}>
                            {config.label ?? name}
                        </InputLabel>

                        <Select
                            labelId={`${name}-label`}
                            value={value ?? ""}
                            onChange={(event) => {
                                form.setField(
                                    name,
                                    event.target.value === ""
                                        ? null
                                        : event.target.value
                                );
                            }}
                        >
                            {!config.required && (
                                <MenuItem value="">
                                    <em>Brak</em>
                                </MenuItem>
                            )}

                            {renderSelectOptions(
                                config.selectOptions ?? []
                            )}
                        </Select>

                        {(errorText || config.description) && (
                            <FormHelperText>
                                {errorText || config.description}
                            </FormHelperText>
                        )}
                    </FormControl>
                );


            case "select-multiple":
                return (
                    <FormControl
                        fullWidth
                        size="small"
                        variant="standard"
                        disabled={Boolean(config.disabled)}
                        required={Boolean(config.required)}
                        error={Boolean(errorText)}
                    >
                        <InputLabel id={`${name}-label`}>
                            {config.label ?? name}
                        </InputLabel>

                        <Select
                            multiple
                            labelId={`${name}-label`}
                            value={
                                Array.isArray(value)
                                    ? value
                                    : []
                            }
                            onChange={(event) => {
                                form.setField(
                                    name,
                                    event.target.value
                                );
                            }}
                        >
                            {renderSelectOptions(
                                config.selectOptions ?? []
                            )}
                        </Select>

                        {(errorText || config.description) && (
                            <FormHelperText>
                                {errorText || config.description}
                            </FormHelperText>
                        )}
                    </FormControl>
                );


            case "switch":
                return (
                    <FormControlLabel
                        label={config.label ?? name}
                        control={
                            <Switch
                                size="small"
                                checked={Boolean(value)}
                                disabled={Boolean(config.disabled)}
                                onChange={(event) => {
                                    form.setField(
                                        name,
                                        event.target.checked
                                    );
                                }}
                            />
                        }
                    />
                );


            case "boolean":
                return (
                    <FormControlLabel
                        label={config.label ?? name}
                        control={
                            <Checkbox
                                size="small"
                                checked={Boolean(value)}
                                disabled={Boolean(config.disabled)}
                                onChange={(event) => {
                                    form.setField(
                                        name,
                                        event.target.checked
                                    );
                                }}
                            />
                        }
                    />
                );


            default:
                return (
                    <TextField
                        {...commonProps}
                        type={
                            ["email", "password"].includes(config.type)
                                ? config.type
                                : "text"
                        }
                        value={value ?? ""}
                        onChange={(event) => {
                            form.setField(
                                name,
                                event.target.value
                            );
                        }}
                    />
                );
        }
    };

    const tagsFieldSchema = entity?.schema?.editForm?.schema?.find(i => i.name === 'tags');

    if (!data) {
        return null;
    }

    return (
        <Box
            sx={{
                width: "100%",
            }}
        >

            {/* Aktywny / slug / własność klienta */}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "100px 100px 1fr",
                    },
                    gap: 2,
                    alignItems: "end",
                    mb: 2,
                }}
            >
                <Box>
                    {renderInput("is_active")}
                </Box>
                <Box>
                    {renderInput("is_customer_owned")}
                </Box>
                <Box>
                    {renderInput("slug")}
                </Box>
            </Box>


            {/* Typ */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr 1fr 1fr",
                    },
                    gap: 2,
                    alignItems: "start",
                    mb: 2,
                }}
            >
                <Box>
                    {renderInput("type_id")}
                </Box>
                <Box>
                    {renderInput("structure_id")}
                </Box>
                <Box>
                    {renderInput("code")}
                </Box>
                <Box>
                    {renderInput("external_code")}
                </Box>

            </Box>
            


            {/* Klient / nazwa */}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                    },
                    gap: 2,
                    mb: 2,
                }}
            >
                <Box>
                    {renderInput("contractor_id")}
                </Box>

                <Box>
                    {renderInput("name")}
                </Box>
            </Box>


            {/* Reporter / prowadzący */}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                    },
                    gap: 2,
                    mb: 2,
                }}
            >
                <Box>
                    {renderInput("reporter_id")}
                </Box>

                <Box>
                    {renderInput("assignee_id")}
                </Box>
            </Box>


            {/* Termin / status */}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                    },
                    gap: 2,
                    mb: 2,
                }}
            >
                <Box>
                    {renderInput("due_date")}
                </Box>

                <Box>
                    {renderInput("status_id")}
                </Box>
            </Box>


            {/* Opis */}

            <Box sx={{ mb: 2 }}>
                {renderInput("description", {
                    rows: 6,
                })}
            </Box>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                    mt: 3,
                }}
            >
                {form.reset && (
                    <Button
                        type="button"
                        variant="outlined"
                        color="warning"
                        disabled={!form.isChanged}
                        onClick={() => form.reset()}
                    >
                        Anuluj zmiany
                    </Button>
                )}

                <Button
                    onClick={form.submit}
                    variant="contained"
                    disabled={
                        !form.isChanged || form.isValid === false
                    }
                >
                    {loading
                        ? "Zapisywanie..."
                        : "Zapisz"}
                </Button>
            </Box>
            
            <ProductTags 
                value={data['tags']}
                options={entity?.schema?.options?.tags ?? []}
                onChange={data => entity.update(id, {'tags' : data})}
                disabled={tagsFieldSchema?.disabled}
            /> 
        </Box>
    );
};

export default ProductForm;