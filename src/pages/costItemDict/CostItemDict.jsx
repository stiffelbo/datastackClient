import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

//Pages
import CostItemPage from './CostItemPage';

const entityName = 'CostItemDict';
const basePath = '/costitemdict';
const endpoint = '/cost_item_dict/';


const CostItemDict = () => {
    const entity = useEntity({ endpoint });
    
    useEffect(() => {
        entity.refresh();
    }, []);

    return (
        <BaseEntityDashboard
             renderPage={(props) => <CostItemPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            listProps={{}}
        />
    );
};

export default CostItemDict;
