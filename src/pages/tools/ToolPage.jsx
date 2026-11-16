import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

import ToolDetails from './ToolDetails';
import ToolProducts from './ToolProducts';

const ToolPage = ({
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
      pageKey: 'tools_details', // klucz z rejestru stron
      component: <ToolDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
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
      headerFields={['name']}
    />
  );
}

export default ToolPage;