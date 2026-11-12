import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import ToolPage from './ToolPage';

const entityName = "Tools";
const basePath = "/tools";
const endpoint = "/tools/";

const Dashboard = () => {
    
    const entity = useEntity({ entityName, endpoint });
    
    return (
        <BaseEntityDashboard
            renderPage={(props) => <ToolPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Dashboard;
