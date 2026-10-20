import React from 'react';

import ProductDetails from '../product/ProductDetails';

import useEntity from '../../hooks/useEntity';

const ProductDetailsWrapper = ({ id, row, entity, rwd, dashboard }) => {

    if(!row?.product_id) {
        return <div><p>Nie wskazano produktu po product_id</p><pre>{JSON.stringify(row, null, 2)}</pre></div>;
    }

    const productEntity = useEntity({ entityName: 'Product', endpoint: '/product/', query : {id : row?.product_id} });
    const productRow  = productEntity?.rows?.[0] || null;
    if(!productRow) {
        return <p>Loading product details...</p>;
    }
    return (
        <ProductDetails
            id={row?.product_id}
            row={productRow}
            entity={productEntity}
            rwd={rwd}
            dashboard={dashboard}
        />
    );
}

export default ProductDetailsWrapper;