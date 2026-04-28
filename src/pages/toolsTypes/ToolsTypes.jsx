import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import ToolTypePage from './ToolTypePage';

const entityName = "ToolsTypes";
const basePath = "/toolstypes";
const endpoint = "/tools_types/";

const Dashboard = () => {
    
    const entity = useEntity({ entityName, endpoint });
    
    return (
        <BaseEntityDashboard
            renderPage={(props) => <ToolTypePage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Dashboard;
