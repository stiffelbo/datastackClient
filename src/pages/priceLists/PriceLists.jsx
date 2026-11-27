import React, { useEffect } from 'react';
import { useParams } from "react-router-dom";
//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import PriceListPage from './PriceListPage';

const entityName = "PriceLists";
const basePath = "/pricelists";
const endpoint = "/price_lists/";

const PriceLists = () => {
    const { id, tab } = useParams();
    const entity = useEntity({ endpoint, entityName, initialId : id ? Number(id) : null });
    
    return (
        <BaseEntityDashboard
            renderPage={(props) => <PriceListPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default PriceLists;
