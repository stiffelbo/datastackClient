import React from 'react';

// Hooks
import useEntity from '../../hooks/useEntity';

// Components
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import WhShippingPage from './WhShippingPage';

const entityName = "WhShipping";
const basePath = "/whshipping";
const endpoint = "/wh_shipping/";

const Dashboard = () => {
    const dashboardEntity = useEntity({ entityName, endpoint });

    return (
        <BaseEntityDashboard
            renderPage={(props) => <WhShippingPage entity={dashboardEntity} entityName={entityName} {...props} />}
            entity={dashboardEntity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Dashboard;