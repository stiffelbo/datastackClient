import React from 'react';
//Hooks
import useEntity from '../../hooks/useEntity';

//Comp
import PowerTable from '../../components/powerTable/powerTable';

const endpoint = '/period_structures_costs/';
const entityName = 'PeriodStructuresCosts';


const Costs = () => {

    const entity = useEntity({endpoint});

    return (
        <PowerTable
            entityName={entityName}
            data={entity.rows}
            height={window.innerHeight - 90}
            width={window.innerWidth}
            loading={entity.loading}
            onRefresh={entity.refresh}
            columnSchema={entity.schema.columns}
            onEdit={entity.update}

            actions={entity.schema.actions}
            onMultiDelete={entity.removeMany}
            bulkEditFormSchema={entity.schema.bulkEditForm}
            onBulkEdit={entity.updateMany}

            importSchema={[]}
            onUpload={null}
        />
    );
}

export default Costs;