import React from 'react';

// Hooks
import useEntity from '../../hooks/useEntity';

// Components
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

const entityName = "WhShifts";
const basePath = "/whshifts";
const endpoint = "/wh_shifts/";

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