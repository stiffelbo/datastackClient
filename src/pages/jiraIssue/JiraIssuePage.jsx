// pages/Employees/JiraIssuePage.jsx
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

import JiraIssueDetails from './JiraIssueDetails';
import JiraIssueClockify from './JiraIssueClockify';
import JiraIssueCosts from './JiraIssueCosts';
import JiraIssueProductionTasks from './JiraIssueProductionTasks';
import JiraIssueMaterials from './JiraIssueMaterials';
import JiraIssueWorklog from './JiraIssueWorklog';
import JiraIssueMachinesUsage from './JiraIssueMachinesUsage';
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
      component: <JiraIssueClockify sygn={row?.jira_key} rwd={rwd}/>,
    },
    {
      key: 'worklog',
      label: 'Czas pracy',
      pageKey: 'jiraissue.worklog', // klucz z rejestru stron
      component: <JiraIssueWorklog id={id} row={row} rwd={rwd}/>,
    },
    {
      key: 'costs',
      label: 'Zakupy',
      pageKey: 'jiraissue.costs', // klucz z rejestru stron
      component: <JiraIssueCosts id={id} rwd={rwd}/>,
    },
    {
      key: 'productionTasks',
      label: 'Zadania produkcyjne',
      pageKey: 'jiraissue.productiontasks', // klucz z rejestru stron
      component: <JiraIssueProductionTasks id={id} row={row} rwd={rwd}/>,
    },
    {
      key: 'materials',
      label: 'Materiały',
      pageKey: 'jiraissue.materials', // klucz z rejestru stron
      component: <JiraIssueMaterials id={id} row={row} rwd={rwd}/>,
    },
 
    {
      key: 'machinesUsage',
      label: 'Użycie maszyn',
      pageKey: 'jiraissue.machinesusage', // klucz z rejestru stron
      component: <JiraIssueMachinesUsage id={id} row={row} rwd={rwd}/>,
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
      heightSpan={entity.heightSpan}
      headerFields={['jira_key', 'name']}
    />
  );
};

export default JiraIssuePage;
