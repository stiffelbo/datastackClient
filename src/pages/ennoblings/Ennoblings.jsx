import React, { useEffect } from 'react';
import { useParams } from "react-router-dom";
//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import EnnoblingPage from './EnnoblingPage';

const entityName = "Ennoblings";
const basePath = "/ennoblings";
const endpoint = "/ennoblings/";

const Ennoblings = () => {
    const { id, tab } = useParams();
    const entity = useEntity({ endpoint, entityName, initialId : id ? Number(id) : null });
    
    return (
        <BaseEntityDashboard
            renderPage={(props) => <EnnoblingPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Ennoblings;
