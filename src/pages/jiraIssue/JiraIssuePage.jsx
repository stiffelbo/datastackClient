import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

import JiraIssueDetails from './JiraIssueDetails';
import LogForm from '../../components/logForm/LogForm';
import JiraIssueClockify from './JiraIssueClockify';
import JiraIssueReports from './JiraIssueReports';
import Bilans from './Bilans';


const JiraIssuePage = ({
  entityName,
  entity,
  dashboard,
  rwd,
  id,
  row,
  rows,
  schema,
  onChangeId,
}) => {
  const { tab, setTab } = dashboard;

  // tu definicje tabsów i propsy dla subkomponentów
  const tabs = [
    {
      key: 'details',
      label: 'Edytuj',
      pageKey: 'jiraissue.details', // klucz z rejestru stron
      component: <JiraIssueDetails id={id} row={row} rwd={rwd} entity={entity} dashboard={dashboard}/>,
    },
    {
      key: 'reports',
      label: 'Raporty',
      pageKey: 'jiraissue.reports', // klucz z rejestru stron
      component: <JiraIssueReports id={id} row={row} rwd={rwd}/>,
    },
    {
      key: 'clockify',
      label: 'Clockify',
      pageKey: 'jiraissue.clockify', // klucz z rejestru stron
      component: <JiraIssueClockify sygn={row?.jira_key} rwd={rwd}/>,
    },
    {
      key: 'bilans',
      label: 'Bilans',
      pageKey: 'jiraissue.bilans', // klucz z rejestru stron
      component: <Bilans data={row} rwd={rwd}/>,
    },
   
    // itd...
  ];

  return (
    <BaseEntityPage
      entityName={entityName}
      id={id}
      rows={rows}
      row={row}
      onChangeId={onChangeId}
      tabs={tabs}
      tab={tab}
      setTab={setTab}
      rwd={rwd}
      heightSpan={entity.heightSpan}
      headerFields={['jira_key', 'name']}
    />
  );
};

export default JiraIssuePage;
