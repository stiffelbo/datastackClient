import React from "react";

import { Box } from "@mui/material";

import useEntity from '../../hooks/useEntity';
import PowerTable from "../../components/powerTable/powerTable";

const ProductOrders = ({id, row, entity, rwd, dashboard}) => {
    
    const entityName = "ProductOrderForProduct";
    const endpoint = "/product_order/"
    const ordersEntity = useEntity({ entityName : `Product_${id}_Order`, endpoint, query: {product_id : id} });

    return (
                <Box pt={2}>
                    <PowerTable
                        entityName={entityName}
                        data={ordersEntity.rows}            // zostanie nadpisane przez ApiLoader -> props.data
                        height={rwd.height - 202}
                        rowHeight={60}
                        loading={ordersEntity.loading}
                        columnSchema={ordersEntity.schema.columns}
                        bulkEditFormSchema={ordersEntity.schema.bulkEditForm}
                        onSelect={null}
                        selected={null}
                        onRefresh={ordersEntity.refresh}
                        onEdit={ordersEntity.updateField}
                        onBulkEdit={ordersEntity.updateMany}
                        onDelete={ordersEntity.remove}
                        onBulkDelete={ordersEntity.removeMany}
                        error={ordersEntity.error}
                        clearError={ordersEntity.clearError}
                    />
                </Box>
                )
}

export default ProductOrders;