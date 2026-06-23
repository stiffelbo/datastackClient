import React from 'react';
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

import JiraIssuePage from './JiraIssuePage';

import RenderLink from "./RenderLink";

const entityName = "JiraIssueHistory";
const basePath = "/jiraissuehistory";
const endpoint = "/jira_issue/";

const JiraIssueHistory = () => {
    const entity = useEntity({ entityName, endpoint, query: {is_active: false} });

    return (
        <BaseEntityDashboard
            renderPage={(props) => <JiraIssuePage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            refreshId={true}
            listProps={
                {
                    treeConfig: {
                        parentField: 'jira_parent_key',
                        idField: 'jira_key',
                        rootValue: null
                    }
                }
            }
        />
    );
};

export default JiraIssueHistory;
