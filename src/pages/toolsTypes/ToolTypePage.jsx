
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import ToolTypeDetails from './ToolTypeDetails';
import ToolTypeMachines from './ToolTypeMachines';

const ToolTypePage = ({
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
      pageKey: 'tool_type_details', // klucz z rejestru stron
      component: <ToolTypeDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'machines',
      label: 'Maszyny',
      pageKey: 'tool_type_machines', // klucz z rejestru stron
      component: <ToolTypeMachines id={id} data={row} rwd={rwd}/>,
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

export default ToolTypePage;
