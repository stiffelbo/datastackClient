import React from "react";

//Mui
import { Box } from '@mui/material';

import FormTemplate from '../../components/powerTable/form/formTemplate';

const JiraIssueResourceUsageDetails = ({id, row, entity, rwd, dashboard}) => {
    const onCancel = () => {
        dashboard.setCurrentId(null);
        dashboard.setTab(null);
    }
    
    return <Box sx={{width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100%'}}>
        <pre>
            {JSON.stringify(row)}
        </pre>
    </Box>
}

export default JiraIssueResourceUsageDetails;