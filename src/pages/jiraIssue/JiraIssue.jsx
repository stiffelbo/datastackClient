import React, {useEffect} from 'react';
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

import JiraIssuePage from './JiraIssuePage';

const entityName = 'JiraIssue';
const basePath = "/jiraissue";

const JiraIssue = () => {
    const entity = useEntity({ endpoint: '/jira_issue/' });
    useEffect(() => {
        entity.refresh();
    }, []);

    return (
        <BaseEntityDashboard
            renderPage={(props) => <JiraIssuePage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default JiraIssue;
