import React from 'react';

// Hooks
import useEntity from '../../hooks/useEntity';

// Components
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import ProductOrderProductionPage from './ProductOrderProductionPage';

const entityName = "ProductOrderProduction";
const basePath = "/productorderproduction";
const endpoint = "/product_order/";

const Dashboard = () => {
    const dashboardEntity = useEntity({ entityName, endpoint, query: {onProduction: true} });

    return (
        <BaseEntityDashboard
            renderPage={(props) => (
                <ProductOrderProductionPage
                    entity={dashboardEntity}
                    entityName={entityName}
                    {...props}
                />
            )}
            entity={dashboardEntity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Dashboard;