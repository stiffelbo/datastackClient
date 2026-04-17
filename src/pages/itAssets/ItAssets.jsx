import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import PowerTable from '../../components/powerTable/powerTable';

const entityName = 'ItAssets';
const endpoint = '/it_assets/';

const ItAssets = () => {
    const entity = useEntity({ entityName, endpoint });
    useEffect(() => {
        entity.refresh();
    }, []);
    return (
        <PowerTable
            entityName={entityName}
            width={window.innerWidth}
            height={window.innerHeight - 90}
            rowHeight={45}

            loading={entity.loading}
            data={entity.rows}
            columnSchema={entity.schema.columns}

            addFormSchema={entity.schema.addForm}
            bulkEditFormSchema={null}
            importSchema={null}

            onRefresh={entity.refresh}
            onPost={entity.create}
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

export default ItAssets;
