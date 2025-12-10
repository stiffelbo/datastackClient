
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import MaterialProcesses from './MaterialProcesses';
import MaterialDetails from './MaterialDetails';

const MaterialPage = ({
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
      pageKey: 'material_details', // klucz z rejestru stron
      component: <MaterialDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'processes',
      label: 'Procesy',
      pageKey: 'material_process', // klucz z rejestru stron
      component: <MaterialProcesses id={id} data={row} rwd={rwd} />,
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
    />
  );
};

export default MaterialPage;
