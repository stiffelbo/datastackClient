import React from 'react';
import PowerTable from '../../components/powerTable/powerTable';

//Mui
import { Alert } from '@mui/material';

const IssueClockify = ({ data }) => {
  if (!data) {
    return <Alert severity='error'>Brak danych clockify</Alert>
  }

  return (
      <PowerTable 
        entity="JiraIssue_clockify"
        data={data}
        seleted={null}
        selectedItems={null}
      />
  );
};


export default IssueClockify;
