import React from 'react';

// Hooks
import useEntity from '../../hooks/useEntity';

// Components
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

const entityName = "WhShippingItems";
const basePath = "/whshippingitems";
const endpoint = "/wh_shipping_items/";

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