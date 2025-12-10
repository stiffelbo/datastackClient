import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import ProcessPage from './ProcessPage';

const entityName = "Processes";
const basePath = "/processes";
const endpoint = "/processes/";

const Dashboard = () => {
    
    const entity = useEntity({ endpoint });
    
    return (
        <BaseEntityDashboard
            renderPage={(props) => <ProcessPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            listProps={
                {
                    treeConfig: {
                        parentField: 'master_process_id',
                        idField: 'id',
                        rootValue: null
                    }
                }
            }
        />
    );
};

export default Dashboard;
