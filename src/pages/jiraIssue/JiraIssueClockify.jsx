import React, {useEffect} from "react";

import ApiLoader from '../../components/ApiLoader';
import PowerTable from "../../components/powerTable/powerTable";
import { Alert } from "@mui/material";

const entityName = "JiraIssueClockify_Page";

const JiraIssueClockify = ({ sygn = '', rwd }) => {
  if (!sygn) {
    return (
      <Alert severity="warning">
        Brak Sygnatury Issue dla pobrania wpisów w clockify
      </Alert>
    );
  }

  const urlData = `/clockify/getByIssue.php?sygn=${sygn}`;

  return (
    <ApiLoader
      url={{ data: urlData }}
      entityName={entityName}
      deps={[sygn]}          // 👈 TU DODANE
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

export default JiraIssueClockify;