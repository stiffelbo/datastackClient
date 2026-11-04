import React from 'react';

// Hooks
import useEntity from '../../hooks/useEntity';

// Components
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import WhStockEntriesItemPage from './WhStockEntriesItemPage';

const entityName = "WhStockEntries";
const basePath = "/whstockentries";
const endpoint = "/wh_stock_entries/";

const Dashboard = () => {

    const dashboardEntity = useEntity({ entityName, endpoint, query: { stock: true }, querySchema: { stock: true } });

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