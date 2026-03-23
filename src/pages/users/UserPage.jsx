
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

import PageUser from './PageUser';
import UsersProcess from './UsersProcess';
import BrigadeMapper from './BrigadeMapper';

const UsersPage = ({
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
      key: 'pages',
      label: 'Strony',
      pageKey: 'user.pages', // klucz z rejestru stron
      component: <PageUser id={id} row={row} rwd={rwd}/>,
    },
    {
      key: 'procesy',
      label: 'Procesy',
      pageKey: 'user.proceses', // klucz z rejestru stron
      component: <UsersProcess id={id} row={row} rwd={rwd}/>,
    },
    {
      key: 'brygady',
      label: 'Brygady',
      pageKey: 'user.brigades', // klucz z rejestru stron
      component: <BrigadeMapper id={id} row={row} rwd={rwd}/>,
    },
    // itd...
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

export default UsersPage;
