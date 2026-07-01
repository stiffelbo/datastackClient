
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import EmployeeDetails from './EmployeeDetails';
import EmployeeRCP from './EmployeeRcp';

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
      pageKey: 'employee_details',
      component: <EmployeeDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard}/>,
    },
    {
      key: 'employee_rcp',
      label: 'RCP',
      pageKey: 'employee_rcp',
      component: <EmployeeRCP id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard}/>,
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
