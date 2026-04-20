import React from 'react';
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

// Page Components 
import ItAssetPage from './ItAssetPage';

const entityName = 'ItAssets';
const basePath = "/itassets";
const endpoint = '/it_assets/';

const ItAssets = () => {
    const entity = useEntity({ entityName, endpoint });
    return (
        <BaseEntityDashboard
            renderPage={(props) => <ItAssetPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            refreshId={true}
        />
    );
};

export default ItAssets;
