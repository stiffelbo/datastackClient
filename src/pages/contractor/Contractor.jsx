import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import ContractorPage from './ContractorPage';

const Contractor = () => {
    const entityName = 'Contractor';
    const entity = useEntity({ endpoint: '/contractor/' });
    const basePath = "/contractor";
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
