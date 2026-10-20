import React, { useState, useEffect } from 'react';

//Mui
import { Stack } from '@mui/material';

import http from '../../http';
import { getTree } from '../../utils/getTree';
import useEntity from '../../hooks/useEntity';

import PowerTable from '../../components/powerTable/powerTable';
import FormTemplate from '../../components/powerTable/form/formTemplate';

import ProductForm from './ProductForm';
import ProductTags from './ProductTags';
import ProductContent from './ProductContent';
import ProductActivityThread from './ProductActivityThread';
import NumismaticInfo from '../numismatics/NumismaticsInfo';



const ProductDetails = ({ id, row, entity, rwd, dashboard }) => {
    const [productData, setProducData] = useState({});
    const [loading, setLoading] = useState(false);

    const onCancel = () => {
        dashboard.setCurrentId(null);
        dashboard.setTab(null);
    }

    const fetchData = async (id) => {
        setLoading(true);

        const resp = await http.get('product/getOne.php?id=' + id, {});

        setProducData(resp);
        setLoading(false);
    }

    useEffect(() => {
        fetchData(id);
    }, [id]);

    const entityName = "ProductActivity";
    const basePath = "/product_activity";
    const endpoint = "/product_activity/";

    const activityEntity = useEntity({ entityName: entityName, endpoint: endpoint, schemaQuery: { id: id }, query: { id: id }, itemId: id, reload: true });



    return (
        <Stack
            spacing={3}
            sx={{
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
            }}
        >
            <ProductForm
                id={id}
                data={row}
                schema={entity.schema.editForm.schema}
                onSubmit={entity.update}
                loading={entity.loading}
                entity={entity}
            />

            {row?.numismatic_id && (
                <NumismaticInfo id={row.numismatic_id} />
            )}

            <PowerTable
                entityName="ProductTree"
                data={getTree(entity.rows, id)}
                height={300}
                treeConfig={{
                    enabled: true,
                    parentField: 'parent_id',
                    idField: 'id',
                    rootValue: null,
                }}
                onSelect={dashboard.setCurrentId}
                selected={dashboard.currentId}
                enableExport={false}
                onRefresh={null}
            />

            <ProductActivityThread
                product={row}
                entity={entity}
                activityEntity={activityEntity}
            />
        </Stack>
    );

}

export default ProductDetails;