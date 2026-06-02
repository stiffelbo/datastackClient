import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

const entityName = "ProcessesResources";
const basePath = "/processesresources";
const endpoint = "/processes_resources/";

const Dashboard = () => {
    
    const entity = useEntity({ entityName, endpoint });
    entity.schema.addForm = null; // ukrywa przycisk "Add" w dashboardzie.
    entity.schema.importSchema = null; // ukrywa przycisk "Import" w dashboardzie.
    return (
        <BaseEntityDashboard
            renderPage={null}
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
