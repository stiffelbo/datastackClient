import React from 'react';

import { Box } from '@mui/material';
import useEntity from '../../hooks/useEntity';

import PowerTable from "../../components/powerTable/powerTable";

const WhShippingDocuments = ({id, row, entity, rwd, dashboard}) => {
    
    const entityName = "WhShippingIDDocuments";
    const endpoint = "/wh_documents/"
    const entityItems = useEntity({ entityName : `Shipping_${id}_Documents`, endpoint, query: {shipping_id : id} });

    return (
        <Box pt={2}>
            <PowerTable
                entityName={entityName}
                data={entityItems.rows}            // zostanie nadpisane przez ApiLoader -> props.data
                height={rwd.height - 202}
                rowHeight={60}
                loading={entityItems.loading}
                columnSchema={entityItems.schema.columns}
                bulkEditFormSchema={entityItems.schema.bulkEditForm}
                onSelect={null}
                selected={null}
                onRefresh={entityItems.refresh}
                onEdit={entityItems.updateField}
                onBulkEdit={entityItems.updateMany}
                onDelete={entityItems.remove}
                onBulkDelete={entityItems.removeMany}
                error={entityItems.error}
                clearError={entityItems.clearError}
            />
        </Box>
        )
}

export default WhShippingDocuments;