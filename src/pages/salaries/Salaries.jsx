import React, {useEffect} from 'react';
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';


const entityName = "Salaries";
const basePath = "/salaries";
const endpoint = "/salaries/";

const Salaries = () => {
    const entity = useEntity({ endpoint });
        
    return (
        <BaseEntityDashboard
            renderPage={null}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Salaries;
