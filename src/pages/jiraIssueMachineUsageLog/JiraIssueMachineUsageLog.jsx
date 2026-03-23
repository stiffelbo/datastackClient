import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import PowerTable from '../../components/powerTable/powerTable';

const entityName = 'JiraIssueMachineUsageLog';
const endpoint = '/jira_issue_machine_usage_log/';

const selected = null;
const onSelected = (val) => {
    console.log(val)
}

const selectedItems = [];
const onSelectItems = (val) => {
    console.log(val);
}

const JiraIssueMachineUsageLog = () => {

    const entity = useEntity({ entityName: entityName, endpoint: endpoint });
    useEffect(() => {
        entity.refresh();
    }, []);
    return (
        <PowerTable
            entityName={entityName}
            width={window.innerWidth}
            height={window.innerHeight - 90}
            loading={entity.loading}
            data={entity.rows}
            columnSchema={entity.schema.columns}

            addFormSchema={null}
            bulkEditFormSchema={entity.schema.bulkEditForm}
            importSchema={null}

            onRefresh={entity.refresh}
            onPost={null}
            onEdit={entity.updateField}
            onUpload={null}
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

export default JiraIssueMachineUsageLog;
