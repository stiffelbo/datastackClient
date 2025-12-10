
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import ProcessEmployees from './ProcessEmployees';
import ProcessMachines from './ProcessMachines';
import ProcessMaterials from './ProcessMaterials';
import ProcessDetails from './ProcessDetails';

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
      key: 'process_employee',
      label: 'Pracownicy',
      pageKey: 'process_employee', // klucz z rejestru stron
      component: <ProcessEmployees id={id} data={row} rwd={rwd}/>,
    },
    {
      key: 'process_machine',
      label: 'Maszyny',
      pageKey: 'process_machines', // klucz z rejestru stron
      component: <ProcessMachines id={id} data={row} rwd={rwd}/>,
    },
    {
      key: 'process_materials',
      label: 'Materiały',
      pageKey: 'process_materials', // klucz z rejestru stron
      component: <ProcessMaterials id={id} data={row} rwd={rwd}/>,
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

export default ProcessPage;
