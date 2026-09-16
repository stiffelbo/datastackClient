import React, {useEffect} from "react";

import ApiLoader from '../../components/ApiLoader';
import PowerTable from "../../components/powerTable/powerTable";
import { Alert, Box, Typography } from "@mui/material";

const entityName = "JiraIssueTree";



const RenderContent = ({data, entity, rwd, dashboard, row, loading, onRefresh}) => {
        if(data?.length === 1){
            return <Alert severity="info">
            Nie wykryto struktury drzewa dla taska: {row?.name}
          </Alert>;
        }
        else{
            return (
                <Box pt={2}>
                    <PowerTable
                        entityName={entityName}
                        data={data}            // zostanie nadpisane przez ApiLoader -> props.data
                        height={rwd.height - 202}
                        rowHeight={60}
                        loading={loading}
                        columnSchema={entity.schema.columns}
                        bulkEditFormSchema={entity.schema.bulkEditForm}
                        onSelect={dashboard.setCurrentId}
                        selected={dashboard.currentId}
                        onRefresh={onRefresh}
                        onEdit={entity.updateField}
                        onBulkEdit={entity.updateMany}
                        onDelete={entity.remove}
                        onBulkDelete={entity.removeMany}
                        error={entity.error}
                        clearError={entity.clearError}
                        treeConfig= {{
                            parentField: 'jira_parent_key',
                            idField: 'jira_key',
                            rootValue: null
                        }}
                    />
                </Box>
                )
        }
    }

const JiraIssueTree = ({ id = null, rwd, row, entity, dashboard }) => {
    if (!id) {
        return (
          <Alert severity="warning">
            Brak Id issue
          </Alert>
        );
      }

    const urlData = `/jira_issue/getIssueTree.php?id=${id}`;

    return (
        <ApiLoader
            url={{ data: urlData }}
            entityName={entityName}
            deps={[id]}          // 👈 TU DODANE
            immediate={true}       // (opcjonalnie, domyślnie i tak true)
        >
            <RenderContent 
                data={[]} //injected
                onRefresh={null} //injected
                loading={null} //injected
                entity={entity}
                rwd={rwd}
                dashboard={dashboard}
                row={row}
            />
        </ApiLoader>
    );
}

export default JiraIssueTree;