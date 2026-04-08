import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import useEntity from '../../hooks/useEntity';
import {useRwd} from '../../context/RwdContext';
import { useDashboard } from '../../context/DashboardContext';


import JiraIssuePage from './JiraIssuePage';
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

const entityName = "JiraIssue";
const basePath = "/jiraissuesingle";
const endpoint = "/jira_issue/";

const JiraIssueSingle = () => {
    const { id } = useParams();
    const entity = useEntity({ entityName, endpoint, query: { id: id} });
    
    return (
        <BaseEntityDashboard
            renderPage={(props) => <JiraIssuePage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            refreshId={true}
            mode="singlepage"
        />
    );
};

export default JiraIssueSingle;
