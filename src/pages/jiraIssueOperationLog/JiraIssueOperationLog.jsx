import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import RenderLink from '../jiraIssue/RenderLink';

const entityName = 'JiraIssueOperationLog';
const endpoint = '/jira_issue_operation_log/';
const basePath = "/jiraissueoperationlog/";

const Dashboard = () => {
    
    const entity = useEntity({ entityName, endpoint });

    const columns = entity.schema.columns.map(c => {
        if(c?.field === "issue_id") {
            return {...c, renderCell : params => <RenderLink id={params.value} title="otwórz w nowym oknie" />}
        }else{
            return c;
        }
    });

    entity.schema.columns = columns;
    
    const listProps = {};

    return (
        <BaseEntityDashboard
            renderPage={(props) => <ProcessPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            listProps={
                listProps
            }
        />
    );
};

export default Dashboard;
