
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import MachineDetails from './MachineDetails';
import MachineProcesses from './MachineProcesses';
import MachineResources from './MachineResources';
import MachineToolsTypes from './MachineToolsTypes';

const MachinePage = ({
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

  const tabs = [
    {
      key: 'details',
      label: 'Szczegóły',
      pageKey: 'machine_details', // klucz z rejestru stron
      component: <MachineDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'processes',
      label: 'Procesy',
      pageKey: 'machine_processes', // klucz z rejestru stron
      component: <MachineProcesses id={id} data={row} rwd={rwd}/>,
    },
    {
      key: 'resources',
      label: 'Zasoby',
      pageKey: 'machine_resources', // klucz z rejestru stron
      component: <MachineResources id={id} data={row} rwd={rwd}/>,
    },
    {
      key: 'toolstypes',
      label: 'Typy Narzedzi',
      pageKey: 'machine_tools_types', // klucz z rejestru stron
      component: <MachineToolsTypes id={id} data={row} rwd={rwd}/>,
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
      headerFields={['name', 'brand', 'model']}
    />
  );
};

export default MachinePage;
