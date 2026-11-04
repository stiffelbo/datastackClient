import React from 'react';

// Hooks
import useEntity from '../../hooks/useEntity';

// Components
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import WhInventoryOperationPage from './WhInventoryOperationPage';

const entityName = "WhInventoryOperations";
const basePath = "/whinventoryoperations";
const endpoint = "/wh_inventory_operations/";

const Dashboard = () => {
    const dashboardEntity = useEntity({ entityName, endpoint });

    return (
        <BaseEntityDashboard
            renderPage={(props) => <WhInventoryOperationPage entity={dashboardEntity} entityName={entityName} {...props} />}
            entity={dashboardEntity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Dashboard;