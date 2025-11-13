import React, { useEffect, useState } from 'react';
import ApiLoader from '../../components/ApiLoader';
import PowerTable from '../../components/powerTable/powerTable';

//Mui
import { Alert } from '@mui/material';

const IssueClockify = ({ sygn }) => {
  if (!sygn) {
    return <Alert severity='error'>Brak Sygnatury</Alert>
  }

  return (
    <ApiLoader
      url="/clockify/getByIssue.php"
      params={{ sygn }}
      deps={[sygn]}
      immediate={true}
    >
    </ApiLoader>
  );
};


export default IssueClockify;
