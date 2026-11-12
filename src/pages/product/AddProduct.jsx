import React from 'react';

import useEntity from '../../hooks/useEntity';
import { useForm } from '../../components/powerTable/form/useForm';
import { createRenderInput } from '../../components/common/RenderInput';
import FormActionsBar from '../../components/common/FormActionsBar';
import { Alert, LinearProgress, Box } from '@mui/material';

import ProductTags from './ProductTags';

const AddProduct = ({ data = {}, productEntity, rwd }) => {
    const typeId = data?.type_id;
    const numismaticId = data?.numismatic_id;
    const contractorId = data?.contractor_id;
    const structure_id = data?.structure_id;

    if (!numismaticId) return <Alert severity='warning'>Brak id Numizmatu</Alert>;
    const schemaQuery = { numismatic_id: numismaticId };

    const entity = useEntity({ endpoint: 'product', entityName: 'ProductAdd', schemaQuery: schemaQuery, schemaOnly: true });

    const loading = entity.loading;
    const formSchema = entity?.schema?.addForm?.schema;

    const form = useForm({ schema: formSchema, data: { numismatic_id: numismaticId, contractor_id: contractorId, structure_id: structure_id, type_id: typeId } });
    const renderInput = createRenderInput(form, { mb: 2 });

    if (loading || !formSchema) return <LinearProgress />;

    const handleSubmit = async () => {
        if (form.isValid && !entity.loading && entity.create) {
            const id = await entity.create(form.formState);
            if (id) {
                if (productEntity) {
                    await productEntity.getOne(id);
                }
            }
        }
    }

    return (<Box>
        {renderInput('type_id')}
        {renderInput('numismatic_id')}
        {renderInput('contractor_id')}
        {renderInput('name')}
        {renderInput('structure_id')}
        {renderInput('assignee_id')}
        {renderInput('due_date')}
        {renderInput('description')}
        {renderInput('is_customer_owned')}
        <ProductTags
                value={form.formState['tags']}
                options={entity?.schema?.options?.tags ?? []}
                onChange={value => form.setField('tags', value)}
                disabled={false}
            />
        <FormActionsBar 
            onSubmit={handleSubmit}
            disabled={!form.isValid}
            loading={entity.loading}
        />
    </Box>);

}

export default AddProduct;