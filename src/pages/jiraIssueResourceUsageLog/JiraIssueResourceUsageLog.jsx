import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import PowerTable from '../../components/powerTable/powerTable';

const entityName = 'JiraIssueResourceUsageLog';
const endpoint = '/jira_issue_resource_usage_log/';

const selected = null;
const onSelected = (val) => {
    console.log(val)
}

const selectedItems = [];
const onSelectItems = (val) => {
    console.log(val);
}

const JiraIssueResourceUsageLog = () => {
    const entity = useEntity({ entityName, endpoint });
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

export default JiraIssueResourceUsageLog;
