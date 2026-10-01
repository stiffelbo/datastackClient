import React, {useState, useEffect} from 'react';

//Mui
import { Box } from '@mui/material';

import FormTemplate from '../../components/powerTable/form/formTemplate';
import ProductForm from './ProductForm';
import ProductTags from './ProductTags';
import ProductContent from './ProductContent';

import http from '../../http';
import useEntity from '../../hooks/useEntity';
import ProductActivityThread from './ProductActivityThread';

const ProductDetails = ({id, row, entity, rwd, dashboard}) => {
    const [productData, setProducData] = useState({});
    const [loading, setLoading] = useState(false);
    
    const onCancel = () => {
        dashboard.setCurrentId(null);
        dashboard.setTab(null);
    }

    const fetchData = async(id) => {
        setLoading(true);

        const resp = await http.get('product/getOne.php?id=' + id, {});

        setProducData(resp);
        setLoading(false);
    }

    useEffect(()=>{
        fetchData(id);
    }, [id]);

    const entityName = "ProductActivity";
    const basePath = "/product_activity";
    const endpoint = "/product_activity/";

    const activityEntity = useEntity({ entityName : entityName, endpoint : endpoint, schemaQuery: {id: id}, query: {id : id}, itemId : id, reload : true });

    return <Box sx={{width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%'}}>

        <ProductForm 
            id={id}
            data={row}
            schema={entity.schema.editForm.schema}    
            onSubmit={entity.update}   
            loading={entity.loading} 
            entity={entity}
        />
        <Box sx={{mt: 3}}>
            <ProductActivityThread 
                product={row}
                entity={entity}
                activityEntity={activityEntity}
            /> 
        </Box>

    </Box>
}

export default ProductDetails;