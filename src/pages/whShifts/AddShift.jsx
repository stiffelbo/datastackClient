import React, { useState, useEffect } from 'react';

import {
    Box,
    Alert,
    AlertTitle,
    Button,
    Stack,
    Typography,
} from '@mui/material';

import useEntity from '../../hooks/useEntity';
import useAddShift from './useAddShift';
import { useForm } from '../../components/powerTable/form/useForm';
import { createRenderInput } from '../../components/common/RenderInput';

import FormActionsBar from '../../components/common/FormActionsBar';

const AddShift = ({ element, id, data }) => {
    const [action, setAction] = useState(null);

    useEffect(() => {
        setAction(null);
    }, [element, id]);

    const shiftEntity = useEntity({
        endpoint: 'wh_shifts',
        entityName: 'AddShift',
        schemaQuery: { element, itemId: id },
    });

    const rawSchema = shiftEntity?.schema?.addForm?.schema ?? [];

    const { formSchema, formData, actions, errors, context, availableActions, actionConfig } = useAddShift({ element, data, schema: rawSchema, action });
    const form = useForm({ data: formData, schema: formSchema });
    const renderInput = createRenderInput(form, { mb: 2 });

    const renderContext = () => {
        if (!context) return null;

        return (
            <Alert severity={context.severity ?? "info"} sx={{ mb: 2 }}>
                <AlertTitle>{context.label}</AlertTitle>
                {context.description}
            </Alert>
        );
    };

    const renderActions = () => {
        if (!availableActions?.length) {
            return (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Brak dostępnych operacji dla tej pozycji.
                </Alert>
            );
        }

        return (
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Wybierz operację
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {availableActions.map(item => (
                        <Button
                            key={item.value}
                            variant={
                                action === item.value
                                    ? 'contained'
                                    : 'outlined'
                            }
                            onClick={() => setAction(item.value)}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Stack>
            </Box>
        );
    };

    const renderForm = () => {
        if (!action) return null;

        if (!actionConfig) return null;
        return (
            <Box>
                {actionConfig.fields.map(field => (
                    <React.Fragment key={field}>
                        {renderInput(field)}
                    </React.Fragment>
                ))}
            </Box>
        );
    };

    const renderErrors = () => {
        if (!errors?.length) return null;

        return (
            <Box sx={{ mb: 2 }}>
                {errors.map((error, index) => (
                    <Alert
                        key={`${error.code ?? 'error'}-${index}`}
                        severity="error"
                        sx={{ mb: 1 }}
                    >
                        {error.message}
                    </Alert>
                ))}
            </Box>
        );
    };

    if (!data || !rawSchema) return null;

    const handleSubmit = ()=>{
        shiftEntity.create(form.formState);
    }

    return (
        <Box>
            {renderErrors()}
            {renderContext()}
            {renderActions()}
            {renderForm()}
            <FormActionsBar
                onSubmit={handleSubmit}
                onCancel={null}
                disabled={!form.isValid || !form.isChanged || shiftEntity.loading}
                loading={shiftEntity.loading}
            />
        </Box>
    );
};

export default AddShift;