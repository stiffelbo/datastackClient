
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

const BlankComponent = (props) => {
    console.log(props);
    return <div>
        <p>Blank Komponent</p>
        <pre>{JSON.stringify(props)}</pre>
    </div>
}

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
      key: 'details',
      label: 'Edytuj',
      pageKey: 'employees', // klucz z rejestru stron
      component: <BlankComponent id={id} row={row}/>,
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
