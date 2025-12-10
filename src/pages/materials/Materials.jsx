import React from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import MaterialPage from './MaterialPage';

const entityName = "Materials";
const basePath = "/materials";
const endpoint = "/materials/";

const Dashboard = () => {
    
    const entity = useEntity({ endpoint });
    
    return (
        <BaseEntityDashboard
            renderPage={(props) => <MaterialPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Dashboard;
