import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import NumismaticsPage from './NumismaticsPage';

import TableImage from '../../components/common/TableImage';

const entityName = "Numismatics";
const basePath = "/numismatics";
const endpoint = "/numismatics/";

const getImageCol = (col) => {
    if(!col) return;
    const newCol = {...col};
    newCol.renderCell = params => <TableImage src={params.value}/>
    return newCol;
}

const Dashboard = () => {
    
    const entity = useEntity({ entityName, endpoint });

    //we need to inject profileColumn as the first column in the columns array
    console.log(entity.schema.columns);
    const columns = entity.schema.columns.filter(Boolean).map(col => col && ['obverse_image', 'reverse_image'].includes(col.field) ? getImageCol(col) : col);
    entity.schema.columns = columns;
    
    return (
        <BaseEntityDashboard
            renderPage={(props) => <NumismaticsPage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            listProps={{rowHeight: 120}}
        />
    );
};

export default Dashboard;
