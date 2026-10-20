import React from 'react';

// Hooks
import useEntity from '../../hooks/useEntity';

// Components
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

const entityName = "WhDefinitions";
const basePath = "/whdefinitions";
const endpoint = "/wh_definitions/";

const Dashboard = () => {
    const dashboardEntity = useEntity({ entityName, endpoint });

    return (
        <BaseEntityDashboard
            renderPage={null}
            entity={dashboardEntity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Dashboard;