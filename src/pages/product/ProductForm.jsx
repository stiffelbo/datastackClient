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
    Typography,
} from "@mui/material";

import TollOutlinedIcon from '@mui/icons-material/TollOutlined';

import { useForm } from "../../components/powerTable/form/useForm";
import { normalizeSchema } from "../../components/powerTable/form/schemaUtils";
import { copyToClipboard } from "../../utils/copyToClipboard";
import validatorDefault from "../../components/powerTable/form/validator";
import {
    normalizeOptions,
    normalizeDateInputValue,
    normalizeDateTimeLocalInputValue,
} from "../../components/powerTable/form/utils";
import { createRenderInput } from "../../components/common/RenderInput";

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
    const renderInput = createRenderInput(form);

    const tagsFieldSchema = entity?.schema?.editForm?.schema?.find(i => i.name === 'tags');

    

    if (!data) {
        return null;
    }

    const path = `W:\\Tampondruk\\${data['location']}`;

    return (
        <Box sx={{ width: '100%' }}>

            {/* Aktywny / własność klienta / slug */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '100px 100px 1fr' }, gap: 2, alignItems: 'end', mb: 2 }}>
                {renderInput('is_active')}
                {renderInput('is_customer_owned')}
                {renderInput('slug')}
            </Box>

            {/* Typ / struktura / kody */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, alignItems: 'start', mb: 2 }}>
                {renderInput('type_id')}
                {renderInput('structure_id')}
                {renderInput('code')}
                {renderInput('external_code')}
            </Box>

            {/* Klient / nazwa */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                {renderInput('contractor_id')}
                {renderInput('name')}
            </Box>

            {/* Reporter / prowadzący */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                {renderInput('reporter_id')}
                {renderInput('assignee_id')}
            </Box>

            {/* Termin / status */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                {renderInput('due_date')}
                {renderInput('status_id')}
            </Box>

            {/* Opis */}
            <Box sx={{ mb: 2 }}>
                {renderInput('description', { rows: 6 })}
            </Box>

            {/* Akcje formularza */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                {form.reset && (
                    <Button type="button" variant="outlined" color="warning" disabled={!form.isChanged} onClick={() => form.reset()}>
                        Anuluj zmiany
                    </Button>
                )}

                <Button onClick={form.submit} variant="contained" disabled={!form.isChanged || form.isValid === false}>
                    {loading ? 'Zapisywanie...' : 'Zapisz'}
                </Button>
            </Box>

            {/* Ścieżka */}

            {/* Ścieżka / Numizmat */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, my: 2, flexWrap: 'wrap' }}>
                <Typography
                    variant="subtitle2"
                    onClick={() => copyToClipboard(path)}
                    sx={{ cursor: 'pointer', overflowWrap: 'anywhere', '&:hover': { opacity: 0.7 } }}
                    title="Kliknij, aby skopiować ścieżkę"
                >
                    {path}
                </Typography>

                {data?.numismatic_id && (
                    <Button
                        component="a"
                        href={`/datastack/numismatics/${data.numismatic_id}/details`}
                        target="blank"
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<TollOutlinedIcon />}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                        Link do monety
                    </Button>
                )}
            </Box>


            {/* Tagi */}
            <ProductTags
                value={data['tags']}
                options={entity?.schema?.options?.tags ?? []}
                onChange={data => entity.update(id, { tags: data })}
                disabled={tagsFieldSchema?.disabled}
            />

        </Box>
    );

};

export default ProductForm;