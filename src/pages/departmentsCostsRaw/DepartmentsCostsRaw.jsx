import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

const entityName = "DepartmentsCostsRaw";
const basePath = "/departmentscostsraw";
const endpoint = "/departments_costs_raw/";

const DepartmentsCostsRaw = () => {

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

export default DepartmentsCostsRaw;
