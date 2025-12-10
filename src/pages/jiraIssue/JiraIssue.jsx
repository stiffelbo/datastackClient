import React, {useEffect} from 'react';
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

import JiraIssuePage from './JiraIssuePage';

const entityName = "JiraIssue";
const basePath = "/jiraissue";
const endpoint = "/jira_issue/";

const JiraIssue = () => {
    const entity = useEntity({ endpoint });
    return (
        <BaseEntityDashboard
            renderPage={(props) => <JiraIssuePage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            refreshId={true}
        />
    );
};

export default JiraIssue;
