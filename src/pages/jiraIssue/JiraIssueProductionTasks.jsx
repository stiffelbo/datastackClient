import React, { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import PowerTable from '../../components/powerTable/powerTable';

import useEntity from '../../hooks/useEntity';

const JiraIssueProductionTasks = ({ id = null, row = {}, rwd = defaultRwd }) => {
    
    const entityName = "JiraIssueProductionTasks";
    const basePath = "/jiraissue/{id}/productiontasks/";
    const endpoint = "/jira_issue_production_tasks/";
    const query = { issue_id: id };

    const schemaQuery = {
        issue_id: id,
        jira_issue_groups_id: row.jira_issue_groups_id,
        jira_project_key: row.jira_project_key,
        product_group: row.product_group,
    };

    const entity = useEntity({entityName, basePath, endpoint, query, schemaQuery});

    const [selected, setSelected] = useState(null);

    const addTaskSchema = {
        label: 'Dodaj zadanie do: ' + row.jira_key,
        schema: entity.schema.addForm.schema,
    };
    
    return (<Box>
        <PowerTable
            entityName={entityName}
            height={rwd.height - 196}
            loading={entity.loading}
            data={entity.rows}
            columnSchema={entity.schema.columns}

            addFormSchema={addTaskSchema}
            addFormInitialValues={{ issue_id: id, target_qty: row.qty_ordered, selected: selected }}
            bulkEditFormSchema={entity.schema.bulkEditForm}
            importSchema={null}

            onRefresh={entity.refresh}
            onPost={entity.create}
            onEdit={entity.updateField}
            onUpload={null}
            onBulkEdit={entity.updateMany}
            onDelete={entity.remove}
            onBulkDelete={entity.removeMany}

            error={entity.error}
            clearError={entity.clearError}

            selected={selected}
            onSelect={setSelected}
        />
    </Box>);
}

export default JiraIssueProductionTasks;