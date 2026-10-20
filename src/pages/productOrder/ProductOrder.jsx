import React from 'react';

// Hooks
import useEntity from '../../hooks/useEntity';

// Components
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import ProductOrderPage from './ProductOrderPage';

const entityName = "ProductOrder";
const basePath = "/productorder";
const endpoint = "/product_order/";

const Dashboard = () => {
    const dashboardEntity = useEntity({ entityName, endpoint });

    return (
        <BaseEntityDashboard
            renderPage={(props) => (
                <ProductOrderPage
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