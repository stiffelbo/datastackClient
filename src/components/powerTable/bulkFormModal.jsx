import React from 'react';
import { Modal, Box } from '@mui/material';

import FormTemplate from './form/formTemplate';

const BulkFormModal = ({open, onClose, actionsApi, bulkEditFormSchema = [], onBulkEdit, loading, entityName}) => {
    return <Modal open={open} onClose={onClose}>
            <Box
              role="dialog"
              aria-modal="true"
              sx={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(1100px, 90vw)',
                height: 'min(80vh, 800px)',
                overflowY: 'auto'
              }}
            >
              <FormTemplate
                formLabel={'Edytycja masowa ' + entityName} 
                data={{}}
                schema={bulkEditFormSchema}
                onSubmit={data => onBulkEdit(actionsApi.selectedIds, data)}
                loading={loading}
                onCancel={onClose}
                submitButtonText={`Zapisz zmiany`}
                sendFormData={false}
                mode="bulk"
                addons={{selectedIds: actionsApi?.selectedIds || 0}}
              />
            </Box>            
        </Modal>
}

export default BulkFormModal;