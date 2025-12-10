import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import PageAccessPage from './PagesAccessPage';

const entityName = "PagesAccess";
const basePath = "/pagesaccess";
const endpoint = "/user_page/";

const Dashboard = () => {
    
    const entity = useEntity({ endpoint });
    
    return (
        <BaseEntityDashboard
            renderPage={(props) => <PageAccessPage entity={entity} entityName={entityName} {...props}/>}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Dashboard;
