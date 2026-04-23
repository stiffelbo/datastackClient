
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import ResourceProcesses from './ResourceProcesses';
import ResourceDetails from './ResourceDetails';

const ResourcePage = ({
  entityName,
  entity,
  dashboard,
  id,
  row,
  rows,
  schema,
  rwd,
  onChangeId,
}) => {
  const { tab, setTab } = dashboard;

  // tu definicje tabsów i propsy dla subkomponentów
  const tabs = [
    {
      key: 'details',
      label: 'Szczegóły',
      pageKey: 'resource_details', // klucz z rejestru stron
      component: <ResourceDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'processes',
      label: 'Procesy',
      pageKey: 'resource_process', // klucz z rejestru stron
      component: <ResourceProcesses id={id} data={row} rwd={rwd} />,
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
      headerFields={['name', 'category']}
    />
  );
};

export default ResourcePage;
