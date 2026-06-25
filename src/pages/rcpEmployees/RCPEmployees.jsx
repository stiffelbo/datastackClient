import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import RCPEmployeePage from './RCPEmployeePage';

const entityName = "RCPEmployees";
const basePath = "/rcpemployees";
const endpoint = "/rcp_employees/";

const Dashboard = () => {
    
    const entity = useEntity({ entityName, endpoint });
    entity.schema.addForm = null; // ukrywa przycisk "Add" w dashboardzie.
    entity.schema.importSchema = null; // ukrywa przycisk "Import" w dashboardzie.
    return (
        <BaseEntityDashboard
            renderPage={(props) => <RCPEmployeePage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            listProps={
                {}
            }
        />
    );
};

export default Dashboard;
