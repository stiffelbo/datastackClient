import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import PowerTable from '../powerTable/powerTable';

const OperationLog = ({entityName, endpoint}) => {
    const entity = useEntity({ entityName, endpoint });

    useEffect(() => {
        entity.refresh();
    }, [entityName, endpoint]);

    return (
        <PowerTable
            entityName={entityName}
            width={window.innerWidth}
            height={window.innerHeight - 166}
            rowHeight={45}
            loading={entity.loading}
            data={entity.rows}
            columnSchema={entity.schema.columns}

            addFormSchema={null}
            bulkEditFormSchema={null}
            importSchema={null}

            onRefresh={entity.refresh}
            onPost={null}
            onEdit={entity.updateField}
            onUpload={null}
            onBulkEdit={null}
            onDelete={entity.remove}
            onBulkDelete={null}

            error={entity.error}
            clearError={entity.clearError}

            selected={null}
            onSelect={null}
            selectedItems={null}
            onSelectItems={null}
        />
    );
};

export default OperationLog;
