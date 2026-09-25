import React, {useEffect, useState} from "react";

import useEntity from '../../hooks/useEntity';
import PowerTable from "../../components/powerTable/powerTable";
import { Box } from '@mui/material';



const defaultRwd = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const ContractorJiraIssues = ({ id = '', rwd }) => {

  const entityName = "ContractorJiraIssues";

  const basePath = "/contractor/{id}/issues/";
  const endpoint = "/jira_issue/";
  const query = { contractor_id: id };

  const schemaQuery = {
  };

  const entity = useEntity({entityName, basePath, endpoint, query, schemaQuery});
  
  const [selected, setSelected] = useState(null);
  return (<Box>
        <PowerTable
            entityName={entityName}
            height={rwd.height - 196}
            loading={entity.loading}
            data={entity.rows}
            columnSchema={entity.schema.columns}

            addFormSchema={null}
            addFormInitialValues={null}
            bulkEditFormSchema={null}
            importSchema={null}

            onRefresh={entity.refresh}
            onPost={entity.create}
            onEdit={null}
            onUpload={null}
            onBulkEdit={null}
            onDelete={null}
            onBulkDelete={null}

            error={entity.error}
            clearError={entity.clearError}

            selected={null}
            onSelect={null}
        />
    </Box>);
};

export default ContractorJiraIssues;