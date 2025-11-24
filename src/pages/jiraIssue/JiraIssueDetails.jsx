import React from 'react';

//Mui
import { Box } from '@mui/material';

import FormTemplate from '../../components/powerTable/form/formTemplate';

const JiraIssueDetails = ({id, row, entity, rwd, dashboard}) => {
    const onCancel = () => {
        dashboard.setCurrentId(null);
        dashboard.setTab(null);
    }
    
    return <Box sx={{width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%'}}>

        <FormTemplate 
            formLabel={"Edytuj Jira Issue"}
            sendFormData={false}
            data={row}
            schema={entity.schema.addForm.schema}    
            onSubmit={(data) => entity.update(id, data)}    
            onCancel={onCancel}
        />  
    </Box>

}

export default JiraIssueDetails;