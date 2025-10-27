import React from 'react';
import { Modal, Box } from '@mui/material';

import FormTemplate from './form/formTemplate';
import ErrorAlerts from './errorAlerts';

const BulkFormModal = ({open, onClose, actionsApi, bulkEditFormSchema = {label: '', schema : []}, onBulkEdit, loading, error, clearError, entityName}) => {
    
    const handleClose = () => {
      clearError();
      onClose();
    }

    const handleSubmit = async (data) => {
      const result = await onBulkEdit(actionsApi.selectedIds, data);
      if(!error){
        handleClose();
      }
    }

    const renderResponse = () => {
      return <ErrorAlerts error={error} onClose={clearError} severity='warning'/>
    };
    
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
                formLabel={bulkEditFormSchema.label || 'Edycja masowa ' + entityName} 
                data={{}}
                schema={bulkEditFormSchema?.schema}
                onSubmit={data => handleSubmit(data)}
                loading={loading}
                onCancel={onClose}
                submitButtonText={`Zapisz zmiany`}
                sendFormData={false}
                mode="bulk"
                addons={{selectedIds: actionsApi?.selectedIds || 0}}
              />
              {renderResponse()}       
            </Box>     
        </Modal>
}

export default BulkFormModal;