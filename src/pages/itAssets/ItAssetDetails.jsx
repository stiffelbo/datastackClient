import React from 'react';

//Mui
import { Box } from '@mui/material';

import FormTemplate from '../../components/powerTable/form/formTemplate';
import ItAssetShifts from './ItAssetShifts';

const ItAssetDetails = ({ id, row, entity, rwd, dashboard }) => {
    const onCancel = () => {
        dashboard.setCurrentId(null);
        dashboard.setTab(null);
    }

    return <Box sx={{ width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%' }}>

        <FormTemplate
            formLabel={"Edytuj Asset"}
            sendFormData={false}
            data={row}
            schema={entity.schema.editForm.schema}
            onSubmit={(data) => entity.update(id, data)}
            onCancel={onCancel}
        />
        <ItAssetShifts id={id} row={row} rwd={rwd} entity={entity} dashboard={dashboard} />
    </Box>
}

export default ItAssetDetails;