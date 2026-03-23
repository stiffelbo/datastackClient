import React, { useCallback } from 'react';
import { Box } from '@mui/material';

import useEntity from '../../hooks/useEntity';
import {useAuth} from '../../context/AuthContext';

const JiraIssueWorklog = ({ id = null, row = {}, rwd = defaultRwd }) => {

    const worklogEntity = useEntity({
        endpoint: '/jira_issue_operation_log/',
        entityName: 'JiraIssueWorklog',
        query: { issue_id: id },
        schemaQuery: { issue_id: id },
    });

    const auth = useAuth();

    return (<Box>
        <h2>JiraIssueWorklog</h2>
        <p>Tu będą czasy pracy produkcyjne dla projektu</p>
        <pre>{JSON.stringify({ rows: worklogEntity.rows}, null, 2)}</pre>
    </Box>);
}

export default JiraIssueWorklog;