import React, {useEffect} from "react";

import ApiLoader from '../../components/ApiLoader';
import PowerTable from "../../components/powerTable/powerTable";
import { Alert } from "@mui/material";

const entityName = "MachineJiraIssueRawLogs";

const MachineRawLogs = ({ id = null, rwd }) => {
  if (!id) {
    return (
      <Alert severity="warning">
        Brak Id Maszyny dla pobrania wpisów TKP
      </Alert>
    );
  }

  const urlData = `/jira_issue_raw_logs/get.php?machine_id=${id}`;

  return (
    <ApiLoader
      url={{ data: urlData }}
      entityName={entityName}
      deps={[id]}          // 👈 TU DODANE
      immediate={true}       // (opcjonalnie, domyślnie i tak true)
    >
      <PowerTable
        entityName={entityName}
        data={[]}            // zostanie nadpisane przez ApiLoader -> props.data
        height={rwd.height - 196}
        rowHeight={60}
      />
    </ApiLoader>
  );
};

export default MachineRawLogs;