import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

const entityName = 'Clockify';
const basePath = '/clockify';
const endpoint = '/clockify/';

const Clockify = () => {
    const entity = useEntity({ endpoint });

    useEffect(() => {
        entity.refresh();
    }, []);

    return (
        <BaseEntityDashboard
            renderPage={null}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            listProps={{}}
        />
    );
};

export default Clockify;
