import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

import JiraIssueOperationLogReports from './JiraIssueOperationLogReports';

const JiraIssueOperationLogPage = ({
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
      key: 'reports',
      label: 'Raporty powiązane',
      pageKey: 'jiraissueoperationlog.relatedreports', // klucz z rejestru stron
      component: <JiraIssueOperationLogReports id={id} row={row} rwd={rwd} />
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
      headerFields={[]}
    />
  );
};

export default JiraIssueOperationLogPage;
