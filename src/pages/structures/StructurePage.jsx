// pages/Employees/StructurePage.jsx
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import StructureDetails from './StructureDetails';
import StructureEmployees from './StructureEmployees';
import StructureProcesses from './StructureProcesses';
import StructureMachines from './StructureMachines';

const StructurePage = ({
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
      label: 'Szczegóły',
      pageKey: 'process_details', // klucz z rejestru stron
      component: <StructureDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'employees',
      label: 'Pracownicy',
      pageKey: 'structure_employees',
      component: <StructureEmployees id={id} data={row} rwd={rwd} />,
    },
    {
      key: 'processes',
      label: 'Procesy',
      pageKey: 'structure_processes',
      component: <StructureProcesses id={id} data={row} rwd={rwd} />,
    },
    {
      key: 'machines',
      label: 'Maszyny',
      pageKey: 'structure_machines',
      component: <StructureMachines id={id} data={row} rwd={rwd} />,
    }
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
      headerFields={['structure_type', 'name']}
    />
  );
};

export default StructurePage;
