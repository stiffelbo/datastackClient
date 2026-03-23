import React, { useCallback } from 'react';
import { Box } from '@mui/material';


const JiraIssueMaterials = ({ id = null, row = {}, rwd = defaultRwd }) => {
    return (<Box>
        <h2>JiraIssueMaterials</h2>
        <p>Tu będą materiały produkcyjne dla projektu</p>
        <pre>{JSON.stringify({ id, row }, null, 2)}</pre>
    </Box>);
}

export default JiraIssueMaterials;