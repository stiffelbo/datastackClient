import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Comp
import JiraIssueResourceUsageDetails from './JiraIssueResourceUsageDetails';

const Page = ({
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
      component: <JiraIssueResourceUsageDetails id={id} row={row} rwd={rwd} entity={entity} dashboard={dashboard}/>,
    },  
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

export default Page;