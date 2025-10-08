// settingsModal.jsx
import React from 'react';
import { Modal, Box } from '@mui/material';
import FormTemplate from '../form/formTemplate';

const SettingsModal = ({ open, onClose, settings, onSave }) => {
    const formSchema = [
        {
            name: 'density',
            label: 'Density',
            type: 'select',
            selectOptions: ['compact', 'standard', 'comfortable'],
            md: 4
        },
        {
            name: 'rowHeight',
            label: 'Wysokość wiersza (px)',
            type: 'number',
            min: 48,
            max: 200,
            md: 4
        },        
    ];

    const handleSubmit = (formData) => {
        onSave(formData);
        onClose();
    };

    const {innerHeight, innerWidth} = window;

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: innerWidth * 0.66,
                heigth: innerHeight * 0.66,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 3,
                borderRadius: 2
            }}>
                <FormTemplate
                    formLabel='Ustawienia Tabeli'
                    schema={formSchema}
                    data={settings}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    sendFormData={false}
                />
            </Box>
        </Modal>
    );
};

export default SettingsModal;
