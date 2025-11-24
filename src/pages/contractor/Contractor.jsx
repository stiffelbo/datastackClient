import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import ContractorPage from './ContractorPage';

const entityName = "Contractor";
const basePath = "/contractor";
const endpoint = "/contractor/";

const Contractor = () => {
    
    const entity = useEntity({ endpoint });
    
    return (
        <BaseEntityDashboard
            renderPage={(props) => <ContractorPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Contractor;
