import React from 'react';

//Mui
import { Box, Typography } from '@mui/material';

import FormTemplate from '../../components/powerTable/form/formTemplate';
import BrigadeMapper from './BrigadeMapper';

const EmployeeDetails = ({id, row, entity, rwd, dashboard}) => {

    const onCancel = () => {
        dashboard.setCurrentId(null);
        dashboard.setTab(null);
    }

    const renderMapper = () => {
        if (row.is_brigade == 1) {
            return <Box mt={3}>
                <Typography variant='h6' gutterBottom>
                    Skład Brygady
                </Typography>
                <BrigadeMapper id={id} data={row} rwd={rwd}/>
            </Box>
        }
    }

    return <Box sx={{width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%'}}>

        <FormTemplate 
            formLabel={"Edytuj Pracownika"}
            sendFormData={false}
            data={row}
            schema={entity.schema.editForm.schema}    
            onSubmit={(data) => entity.update(id, data)}    
            onCancel={onCancel}
        />  
        {renderMapper()}
    </Box>
}

export default EmployeeDetails;