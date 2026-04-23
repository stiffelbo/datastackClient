
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import ProcessUsers from './ProcessUsers';
import ProcessMachines from './ProcessMachines';
import ProcessDetails from './ProcessDetails';
import ProcessResources from './ProcessResources';

const ProcessPage = ({
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
      pageKey: 'process_details', // klucz z rejestru stron
      component: <ProcessDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
     {
      key: 'process_users',
      label: 'Użytkownicy',
      pageKey: 'process_users', // klucz z rejestru stron
      component: <ProcessUsers id={id} data={row} rwd={rwd}/>,
    },
    {
      key: 'process_machines',
      label: 'Maszyny',
      pageKey: 'process_machines', // klucz z rejestru stron
      component: <ProcessMachines id={id} data={row} rwd={rwd}/>,
    },
    {
      key: 'process_resources',
      label: 'Zasoby',
      pageKey: 'process_resources', // klucz z rejestru stron
      component: <ProcessResources id={id} data={row} rwd={rwd}/>,
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

export default ProcessPage;
