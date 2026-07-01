import React, { useEffect } from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

// Comp
import PowerTable from '../powerTable/powerTable';
import RenderLink from '../../pages/jiraIssue/RenderLink';

const OperationLog = ({entityName, endpoint, height = null, issue = {}, label = ""}) => {

    const entity = useEntity({ entityName, endpoint, query: {issue_id : issue.id}, schemaQuery : {issue_id : issue.id}});

    const issueId = issue?.id;

    useEffect(() => {
        entity.refresh();
    }, [entityName, endpoint, issueId]);

    const effectiveHeight = height ? height : window.innerHeight - 166;

    const columns = entity.schema.columns.map(c => {
            if(c?.field === "issue_id") {
                return {...c, renderCell : params => <RenderLink id={params.value} title="otwórz w nowym oknie" />}
            }else{
                return c;
            }
        });
    
    entity.schema.columns = columns;

    return (
        <PowerTable
            entityName={entityName}
            width={window.innerWidth}
            height={effectiveHeight}
            rowHeight={45}
            loading={entity.loading}
            data={entity.rows}
            columnSchema={entity.schema.columns}

            addFormSchema={entity.schema.addForm}
            addFormInitialValues={{issue_id: issue.id}}
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

export default OperationLog;
