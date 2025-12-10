
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import EmployeeProcess from './EmployeeProcess';

const EmployeePage = ({
  entityName,
  entity,
  dashboard,
  id,
  row,
  rows,
  rwd,
  schema,
  onChangeId,
}) => {
  const { tab, setTab } = dashboard;

  // tu definicje tabsów i propsy dla subkomponentów
  const tabs = [
    {
      key: 'employee_process',
      label: 'Procesy',
      pageKey: 'employee_process', // klucz z rejestru stron
      component: <EmployeeProcess id={id} data={row} rwd={rwd}/>,
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
    />
  );
};

export default EmployeePage;
