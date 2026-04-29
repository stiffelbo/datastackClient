import React from 'react';

//Mui
import { Box, Typography, Chip } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import FormTemplate from '../../components/powerTable/form/formTemplate';
import RenderLink from './RenderLink';

const renderLabel = (id) => {
    if (!id) return "Edytuj Jira Issue";

    return (
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="h6">
                Edytuj Jira Issue
            </Typography>

            <RenderLink id={id} />
        </Box>
    );
};



const JiraIssueDetails = ({ id, row, entity, rwd, dashboard }) => {
    const onCancel = () => {
        dashboard.setCurrentId(null);
        dashboard.setTab(null);
    }

    console.log(row);
    
    return <Box sx={{ width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%' }}>

        <FormTemplate
            formLabel={renderLabel(id)}
            sendFormData={false}
            data={row}
            schema={entity.schema.editForm.schema}
            onSubmit={(data) => entity.update(id, data)}
            onCancel={onCancel}
        />
    </Box>
}

export default JiraIssueDetails;