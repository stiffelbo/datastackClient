import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import RCPEmployeeChecks from './RCPEmployeeChecks';

const RCPEmployeePage = ({
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
      key: 'odbicia',
      label: 'Obbicia',
      pageKey: 'rcp_employee_checks', // klucz z rejestru stron
      component: <RCPEmployeeChecks id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
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
      headerFields={['imie', 'nazwisko']}
    />
  );
};

export default RCPEmployeePage;
