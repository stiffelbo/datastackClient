import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Comp
import JiraIssueResourceUsageSplit from './JiraIssueResourceUsageSplit';

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
      key: 'split',
      label: 'Podziel',
      pageKey: 'jiraissue.split', // klucz z rejestru stron
      component: <JiraIssueResourceUsageSplit id={id} row={row} rwd={rwd} entity={entity} dashboard={dashboard}/>,
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