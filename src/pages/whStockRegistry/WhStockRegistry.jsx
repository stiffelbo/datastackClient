import React from 'react';

// Hooks
import useEntity from '../../hooks/useEntity';

// Components
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import WhStockRegistryItemPage from './WhStockRegistryItemPage';

const entityName = "WhStockRegistry";
const basePath = "/whstockregistry";
const endpoint = "/wh_stock_entries/";

const Dashboard = () => {

    const dashboardEntity = useEntity({ entityName, endpoint, query: { stock: false }, querySchema: { stock: false } });

    return (
        <BaseEntityDashboard
            renderPage={(props) => <WhStockRegistryItemPage entity={dashboardEntity} entityName={entityName} {...props} />}
            entity={dashboardEntity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Dashboard;