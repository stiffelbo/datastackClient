import React, {useEffect} from "react";

import ApiLoader from '../../components/ApiLoader';
import PowerTable from "../../components/powerTable/powerTable";
import { Alert } from "@mui/material";

const entityName = "RCPEmployeeChecks";

const RCPEmployeeChecks = ({ id = null, rwd, row }) => {
  if (!id) {
    return (
      <Alert severity="warning">
        Brak Id Pracownika z RCP dla pobrania wpisów odbić
      </Alert>
    );
  }

  const urlData = `/rcp_checks/get.php?employeeId=${row['alarm_id']}`;

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

export default RCPEmployeeChecks;