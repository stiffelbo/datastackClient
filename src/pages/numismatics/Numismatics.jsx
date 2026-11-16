import React, { useEffect } from 'react';
import { useParams } from "react-router-dom";
//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import NumismaticsPage from './NumismaticsPage';

const entityName = "Numismatics";
const basePath = "/numismatics";
const endpoint = "/numismatics/";

const Dashboard = () => {
    const { id, tab } = useParams();
    const entity = useEntity({ entityName, endpoint, initialId : id ? Number(id) : null });
    return (
        <BaseEntityDashboard
            renderPage={(props) => <NumismaticsPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            listProps={{rowHeight: 120}}
            refreshId={true}
        />
    );
};

export default Dashboard;
