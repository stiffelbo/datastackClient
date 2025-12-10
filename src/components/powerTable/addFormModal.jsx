import React, { useState } from 'react';
import { Modal, Box } from '@mui/material';

import { toast } from 'react-toastify';

import FormTemplate from './form/formTemplate';
import ErrorAlerts from './errorAlerts';

const AddFormModal = ({ open, onClose, addFormSchema, onPost, loading, entityName, error, clearError }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
     if (typeof clearError === 'function') clearError();
     if (typeof onClose === 'function') onClose();
  }

  const handleSubmit = async (data) => {
    if (submitting) return; // zabezpieczenie przed podwójnym wysłaniem
    if (typeof onPost !== 'function') {
      toast.error('Brak handlera zapisu (onPost).');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onPost(data);

      // heurystyka sukcesu:
      // - jeśli handler zwróci false -> traktujemy jako błąd
      // - jeśli zwróci obiekt z ok/created/id -> uznajemy sukces
      // - jeśli nic nie zwróci (undefined) -> traktujemy jako sukces
      let ok = true;
      if (result === false) ok = false;
      else if (result && typeof result === 'object') {
        if (Object.prototype.hasOwnProperty.call(result, 'ok')) ok = !!result.ok;
        else if (Object.prototype.hasOwnProperty.call(result, 'created')) ok = !!result.created;
        else if (Object.prototype.hasOwnProperty.call(result, 'updated')) ok = !!result.updated;
        else if (Object.prototype.hasOwnProperty.call(result, 'id')) ok = !!result.id;
        else ok = true;
      }

      if (ok) {
        toast.success(`${entityName || 'Rekord'} zapisany`);
        if (typeof onClose === 'function') handleClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const combinedLoading = !!loading || submitting;

  const renderResponse = () => {
    return <ErrorAlerts error={error} onClose={clearError} severity='warning'/>
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        role="dialog"
        aria-modal="true"
        sx={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(1100px, 90vw)',
          height: 'min(80vh, 800px)',
          overflowY: 'auto',
        }}
      >
        <FormTemplate
          formLabel={addFormSchema?.label ?? 'Dodaj'}
          data={{}}
          schema={addFormSchema?.schema ?? []}
          onSubmit={handleSubmit}
          loading={combinedLoading}
          onCancel={onClose}
          submitButtonText="Zapisz"
          sendFormData={false}
          mode="add"
        />
        {renderResponse()}
      </Box>
    </Modal>
  );
};

export default AddFormModal;
