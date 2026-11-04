import React from 'react';

// Hooks
import useEntity from '../../hooks/useEntity';

// Components
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import WhStockOnProductionItemPage from './WhStockOnProductionItemPage';

const entityName = "WhStockOnProduction";
const basePath = "/whstockonproduction";
const endpoint = "/wh_stock_on_production/";

const Dashboard = () => {
    const dashboardEntity = useEntity({ entityName, endpoint});
    return (
        <BaseEntityDashboard
            renderPage={(props) => <WhStockEntriesItemPage entity={dashboardEntity} entityName={entityName} {...props} />}
            entity={dashboardEntity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Dashboard;