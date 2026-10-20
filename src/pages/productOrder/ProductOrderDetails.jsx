import React from 'react';

import ProductOrderEditForm from './ProductOrderEditForm';

const ProductOrderDetails = ({ id, row, entity, rwd, dashboard }) => {
    return <ProductOrderEditForm 
        id={id}
        row={row}
        entity={entity}
    />;
}

export default ProductOrderDetails;