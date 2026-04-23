import React from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import ResourcePage from './ResourcePage';

const entityName = "Resources";
const basePath = "/resources";
const endpoint = "/resources/";

const Dashboard = () => {
    
    const entity = useEntity({ entityName, endpoint });
    
    return (
        <BaseEntityDashboard
            renderPage={(props) => <ResourcePage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Dashboard;
