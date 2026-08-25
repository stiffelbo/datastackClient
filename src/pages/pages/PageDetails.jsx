import React from 'react';

//Mui
import { Box } from '@mui/material';

import FormTemplate from '../../components/powerTable/form/formTemplate';

import { mergeIntoFormSchema } from '../../utils/mergeIntoFormSchema';

const formPatch = {
    'description' : {
        type: 'textarea',
        rows: 8,
        xl: 12, 
    }
};

const PageDetails = ({id, row, entity, rwd, dashboard}) => {
    
    if(!entity.schema.editForm) return;
    
    const onCancel = () => {
        dashboard.setCurrentId(null);
        dashboard.setTab(null);
    }

    const schema = mergeIntoFormSchema(entity.schema.editForm, formPatch);
    
    return <Box sx={{width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%'}}>

        <FormTemplate 
            formLabel={schema.label}
            sendFormData={false}
            data={row}
            schema={schema.schema}    
            onSubmit={(data) => entity.update(id, data)}    
            onCancel={onCancel}
        />  
    </Box>
}

export default PageDetails;