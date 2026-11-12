import React from 'react';

import useEntity from '../../hooks/useEntity';
import { useForm } from '../../components/powerTable/form/useForm';
import { createRenderInput } from '../../components/common/RenderInput';
import FormActionsBar from '../../components/common/FormActionsBar';
import { Alert, LinearProgress, Box } from '@mui/material';

const AddProductOrder = ({data = {}, ordersEntity, orderId = null, rwd}) => {

    const productId = data?.product_id;
    const contractorId = data?.contractor_id;
    if(!productId) return <Alert severity='warning'>Brak id produktu</Alert>;
    const schemaQuery = {productId : productId};

    const entity = useEntity({endpoint: 'product_order', entityName: 'ProductOrderAdd', schemaQuery: schemaQuery, schemaOnly: true});

    const loading = entity.loading;
    const formSchema = entity?.schema?.addForm?.schema; 
    
    const form = useForm({schema: formSchema, data: {product_id : productId, orderId: orderId, contractor_id: contractorId}});
    const renderInput = createRenderInput(form, {mb: 2});

    if(loading || !formSchema) return <LinearProgress />;

    const handleSubmit = async ()=>{
        if(form.isValid && !entity.loading && entity.create){
            const id = await entity.create(form.formState);
            if(id){
                if(ordersEntity && orderId){
                    await ordersEntity.getOne(id);
                }
            }
        }
    }

    return (<Box>
        {renderInput('order_type_id')}
        {renderInput('contractor_id')}
        {renderInput('qty_ordered')}
        {renderInput('packing_method_id')}
        {renderInput('customer_order_number')}
        {renderInput('deadline')}
        <FormActionsBar 
            onSubmit={handleSubmit}
            disabled={!form.isValid}
            loading={entity.loading}
        />
    </Box>);
}

export default AddProductOrder;