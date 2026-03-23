
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import EmployeeDetails from './EmployeeDetails';

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
      key: 'employee_details',
      label: 'Szczegóły',
      pageKey: 'employee_details', // klucz z rejestru stron
      component: <EmployeeDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard}/>,
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
      headerFields={['first_name', 'last_name']}
    />
  );
};

export default EmployeePage;
