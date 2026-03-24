import React from 'react';

//Mui
import { Box, Typography } from '@mui/material';

import FormTemplate from '../../components/powerTable/form/formTemplate';

const EmployeeDetails = ({id, row, entity, rwd, dashboard}) => {

    const onCancel = () => {
        dashboard.setCurrentId(null);
        dashboard.setTab(null);
    }

    //we need to remove data from 'profile_url' field, because it is not used in edit form, and it causes error when we try to submit the form
    const modifiedRow = { ...row };
    if(row) {
        modifiedRow.profile_url = '';
    }   

    return <Box sx={{width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%'}}>
        
        <FormTemplate 
            formLabel={"Edytuj Pracownika"}
            sendFormData={false}
            data={modifiedRow}
            schema={entity.schema.editForm.schema}    
            onSubmit={(data) => entity.updateFD(id, data)}    
            onCancel={onCancel}
        />  
    </Box>
}

export default EmployeeDetails;