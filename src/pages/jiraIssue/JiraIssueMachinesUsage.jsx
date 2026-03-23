import React, { useCallback } from 'react';
import { Box } from '@mui/material';


const JiraIssueMachinesUsage = ({ id = null, row = {}, rwd = defaultRwd }) => {
    return (<Box>
        <h2>JiraIssueMachinesUsage</h2>
        <p>Tu będą raportu użycia maszyn do projektu</p>
        <pre>{JSON.stringify({ id, row }, null, 2)}</pre>
    </Box>);
}

export default JiraIssueMachinesUsage;