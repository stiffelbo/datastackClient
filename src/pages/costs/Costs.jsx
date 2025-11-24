import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

const entityName = 'Costs';
const basePath = "/deptcosts";

const Costs = () => {

    const entity = useEntity({ endpoint: '/period_structures_costs/' });
    useEffect(() => {
        entity.refresh();
    }, []);

    return (
        <BaseEntityDashboard
            renderPage={null}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Costs;
