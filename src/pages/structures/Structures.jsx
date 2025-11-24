import React, {useEffect} from 'react';
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

//Pages
import StructurePage from './StructurePage';

const entityName = 'Structures';
const basePath = "/structures";

const Structures = () => {
    const entity = useEntity({ endpoint: '/structures/' });
    useEffect(() => {
        entity.refresh();
    }, []);

    return (
        <BaseEntityDashboard
            renderPage={(props) => <StructurePage entity={entity} entityName={entityName} {...props} />}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            listProps={
                {
                    treeConfig: {
                        parentField: 'parent_id',
                        idField: 'id',
                        rootValue: null
                    }
                }
            }
        />
    );
};

export default Structures;
