import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

const entityName = "DepartmentsCosts";
const basePath = "/departmentscosts";
const endpoint = "/departments_costs/";

const DepartmentsCosts = () => {

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

export default DepartmentsCosts;
