
import React, { useState } from 'react';

// MUI
import { Box, Grid, Typography, Divider } from '@mui/material';

import FormTemplate from '../../components/powerTable/form/formTemplate';
import NumismaticInfo from './NumismaticsInfo';

const NumismaticsDetails = ({
    id,
    row,
    entity,
    rwd,
    dashboard,
}) => {

    const [loading, setLoading] = useState(false);

    const onCancel = () => {
        dashboard.setCurrentId(null);
        dashboard.setTab(null);
    };

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: '100%',
                height: '100%',
                maxHeight: '100%',
                overflowY: 'auto',
                p: 2,
            }}
        >
            <FormTemplate
                formLabel="Edytuj Numizmat"
                sendFormData={false}
                data={row}
                schema={entity.schema.editForm.schema}
                onSubmit={(data) => entity.update(id, data)}
                onCancel={onCancel}
            />
            <NumismaticInfo id={id} />
        </Box>
    );
};

export default NumismaticsDetails;
