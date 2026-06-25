import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import ProcessPage from './ProcessPage';

const entityName = "Processes";
const basePath = "/processes";
const endpoint = "/processes/";

const Dashboard = () => {
    
    const entity = useEntity({ entityName, endpoint });
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
            manual={{name: 'ProcessesDoc'}}
        />
    );
};

export default Dashboard;
