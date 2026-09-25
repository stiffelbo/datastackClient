import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import ProductDefinitionsPage from './ProductDefinitionsPage';


const entityName = "ProductDefinitions";
const basePath = "/productdefinitions";
const endpoint = "/product_definitions/";

const Dashboard = () => {
    
    const entity = useEntity({ entityName, endpoint });

    return (
        <BaseEntityDashboard
            renderPage={(props) => <ProductDefinitionsPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Dashboard;
