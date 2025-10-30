import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import PowerTable from '../../components/powerTable/powerTable';

const enityName = 'Periods';

const selected = null;
const onSelected = (val) => {
    console.log(val)
}

const selectedItems = [];
const onSelectItems = (val) => {
    console.log(val);
}

const Salaries = () => {
    const entity = useEntity({ endpoint: '/periods/' });
    useEffect(() => {
        entity.refresh();
    }, []);
    return (
        <PowerTable
            entityName={enityName}
            width={window.innerWidth}
            height={window.innerHeight - 90}
            loading={entity.loading}
            data={entity.rows}
            columnSchema={entity.schema.columns}

            addFormSchema={entity.schema.addForm}
            bulkEditFormSchema={entity.schema.bulkEditForm}
            importSchema={entity.schema.importSchema}

            onRefresh={entity.refresh}
            onPost={entity.create}
            onEdit={entity.updateField}
            onUpload={entity.upload}
            onBulkEdit={entity.updateMany}
            onDelete={entity.remove}
            onBulkDelete={entity.removeMany}

            error={entity.error}
            clearError={entity.clearError}

            selected={selected}
            onSelect={onSelected}
            selectedItems={selectedItems}
            onSelectItems={onSelectItems}
        />
    );
};

export default Salaries;
