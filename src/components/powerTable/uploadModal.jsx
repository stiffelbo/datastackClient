import React, { useState } from 'react';
import { Modal, Box, Alert } from '@mui/material';
import ImportWizard from './importWizard/importWizard';
import ErrorAlerts from './errorAlerts';

const UploadModal = ({ open, onClose, importSchema, onUpload, error, clearError, loading }) => {
    const [resp, setResp] = useState({});

    const { innerHeight, innerWidth } = window;

    if (!importSchema || !onUpload) return <Alert severity='warning'>Brak scheamtu lub handlera uploadu</Alert>

    const handleClose = () => {
        clearError();
        onClose();
    }

    const handleSubmit = async (data) => {
        const result = await onUpload(data);
        setResp(result);
    }

    const renderResponse = () => {
        const { inserted, skiped, ids, errors } = resp;

        return <Box>
            {ids && ids.length && <Alert severity='success'>Wgrano {inserted} nowych wpisów.</Alert>}
            <ErrorAlerts error={errors} onClose={clearError} severity='warning' />
        </Box>
    };

    const fields = Array.isArray(importSchema) ? importSchema : (importSchema?.fields ?? []);
    const lists = Array.isArray(importSchema) ? [] : (importSchema?.lists ?? []);

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: innerWidth * 0.77,
                maxWidth: innerWidth * 0.77,
                heigth: innerHeight * 0.77,
                maxHeightheigth: innerHeight * 0.77,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 3,
                borderRadius: 2
            }}>
                <ImportWizard
                    importSchema={fields}
                    lists={lists}
                    onUpload={handleSubmit}
                    loading={loading}

                />
                {renderResponse()}
            </Box>
        </Modal>
    );
}

export default UploadModal;
