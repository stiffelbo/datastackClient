import React, { useEffect, useState } from "react";

import { Box, Grid } from "@mui/material";

import http from "../../http";
import FieldsAccessControl from "./FieldsAccessControl";


const defaultRwd = {
    width: window.innerWidth,
    height: window.innerHeight,
};


const delimiter = ",";


const parseFields = (value) => {
    if (!value) return [];

    return `${value}`
        .split(delimiter)
        .map((field) => field.trim())
        .filter(Boolean);
};


const PageAccessFields = ({
    id = null,
    row = {},
    rwd = defaultRwd,
    entity = {},
}) => {

    const [schema, setSchema] = useState({});
    const [loading, setLoading] = useState(false);

    const endpoint = row.endpoint;


    const fetchSchema = async () => {
        setLoading(true);

        try {
            const { data } = await http.get(
                `/${endpoint}/getEntitySchema.php`
            );

            setSchema(data);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (endpoint) {
            fetchSchema();
        }
    }, [endpoint]);


    const fields = schema.columns || [];

    const nativeFields = fields.filter((item) => item.native);
    const editableFields = fields.filter((item) => item.editable);


    /*
     * WIDOCZNOŚĆ
     *
     * Jeżeli pole zostaje ukryte,
     * automatycznie blokujemy również jego edycję.
     */
    const onSubmitView = async (value) => {
        const previousViewRestricted = new Set(
            parseFields(row.view_restricted_fields)
        );

        const nextViewRestricted = parseFields(value);


        // Pola, które właśnie zostały ukryte
        const newlyHiddenFields = nextViewRestricted.filter(
            (field) => !previousViewRestricted.has(field)
        );


        await entity.updateField({
            id,
            field: "view_restricted_fields",
            value,
        });


        if (!newlyHiddenFields.length) {
            return;
        }


        const editRestricted = new Set(
            parseFields(row.edit_restricted_fields)
        );


        let editChanged = false;


        newlyHiddenFields.forEach((field) => {
            if (!editRestricted.has(field)) {
                editRestricted.add(field);
                editChanged = true;
            }
        });


        if (!editChanged) {
            return;
        }


        /*
         * Zachowujemy kolejność według schema.
         */
        const nextEditRestricted = editableFields
            .map((item) => item.field)
            .filter((field) => editRestricted.has(field))
            .join(delimiter);


        await entity.updateField({
            id,
            field: "edit_restricted_fields",
            value: nextEditRestricted,
        });
    };


    const onSubmitEdit = (value) => {
        return entity.updateField({
            id,
            field: "edit_restricted_fields",
            value,
        });
    };


    return (
        <Box>
            <Grid container spacing={1}>
                <Grid item size={{md: 6}}>
                    <FieldsAccessControl
                        value={row.view_restricted_fields}
                        schema={nativeFields}
                        onSubmit={onSubmitView}
                        label="Widoczność"
                    />
                </Grid>

                <Grid item size={{md: 6}}>
                    <FieldsAccessControl
                        value={row.edit_restricted_fields}
                        schema={editableFields}
                        onSubmit={onSubmitEdit}
                        label="Edycja"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};


export default PageAccessFields;
