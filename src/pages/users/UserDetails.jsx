import React from 'react';

//Mui
import { Box, Button } from '@mui/material';

import FormTemplate from '../../components/powerTable/form/formTemplate';
import http from '../../http';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const renderImpersonlizeButton = (row, entity, dashboard, onClick) => {
    if (row?.id && entity.schema.access?.is_global_admin) {
        return <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
            <Button variant="contained" color="primary" size="small" sx={{marginBottom: '10px', width: '100%'}} onClick={onClick}>
                Zaloguj Jako {row?.first_name} {row?.last_name}
            </Button>
        </Box>
    }
    return null;
}

const UserDetails = ({id, row, entity, rwd, dashboard}) => {
    const onCancel = () => {
        dashboard.setCurrentId(null);
        dashboard.setTab(null);
    }

    const { refreshUser } = useAuth();
    const navigate = useNavigate();
    
    const handleImpersonalize = async () => {
        try {
            const response = await http.get(`/auth/impersonalize.php?user_id=${row.id}`);
            refreshUser();
            navigate('/');
        } catch (error) {
            console.error('Error while impersonalizing user:', error);
        }
    }
    
    return <Box sx={{width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%'}}>
        <FormTemplate 
            formLabel={"Edytuj Użytkownika"}
            data={row}
            sendFormData={false}
            schema={entity.schema.editForm.schema}    
            onSubmit={(data) => entity.update(id, data)}    
            onCancel={onCancel}
            />  
        {renderImpersonlizeButton(row, entity, dashboard, handleImpersonalize)}
    </Box>
}

export default UserDetails;