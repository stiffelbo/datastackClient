import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import NumismaticsPage from './NumismaticsPage';

const entityName = "Numismatics";
const basePath = "/numismatics";
const endpoint = "/numismatics/";

const Dashboard = () => {
    
    const entity = useEntity({ entityName, endpoint });
    return (
        <BaseEntityDashboard
            renderPage={(props) => <NumismaticsPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            listProps={{rowHeight: 120}}
        />
    );
};

export default Dashboard;
