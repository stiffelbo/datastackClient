import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import NumismaticAccessoryPage from './NumismaticAccessoryPage';

const entityName = "NumismaticAccessories";
const basePath = "/numismaticaccessories";
const endpoint = "/numismatic_accessories/";

const Dashboard = () => {
    
    const entity = useEntity({ entityName, endpoint });
    return (
        <BaseEntityDashboard
            renderPage={(props) => <NumismaticAccessoryPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            listProps={{rowHeight: 120}}
        />
    );
};

export default Dashboard;
