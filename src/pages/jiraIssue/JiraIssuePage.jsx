// pages/Employees/JiraIssuePage.jsx
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

import JiraIssueClockify from './JiraIssueClockify';
import JiraIssueCosts from './JiraIssueCosts';
import JiraIssueDetails from './JiraIssueDetails';
import JiraIssueBilans from './JiraIssueBilans';

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
      key: 'clockify',
      label: 'Clockify',
      pageKey: 'jiraissue.clockify', // klucz z rejestru stron
      component: <JiraIssueClockify sygn={row?.jira_key} />,
    },
    {
      key: 'costs',
      label: 'Koszty',
      pageKey: 'jiraissue.costs', // klucz z rejestru stron
      component: <JiraIssueCosts id={id} rwd={rwd}/>,
    },
    {
      key: 'bilans',
      label: 'Bilans',
      pageKey: 'jiraissue.bilans', // klucz z rejestru stron
      component: <JiraIssueBilans id={id} row={row} rwd={rwd}/>,
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
      heightSpan={190}
    />
  );
};

export default JiraIssuePage;
