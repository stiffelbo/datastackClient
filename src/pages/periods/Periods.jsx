import React, {useEffect} from 'react';
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

import PeriodPage from './PeriodPage';

const entityName = "Periods";
const basePath = "/periods";
const endpoint = "/periods/";

const Periods = () => {
    const entity = useEntity({ endpoint });
    
    return (
        <BaseEntityDashboard
            renderPage={(props) => <PeriodPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Periods;