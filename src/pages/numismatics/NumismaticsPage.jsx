
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import NumismaticsDetails from './NumismaticsDetails';
import NumismaticProducts from './NumismaticProducts';

const NumismaticsPage = ({
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
      label: 'Edycja',
      pageKey: 'numismatics_details', // klucz z rejestru stron
      component: <NumismaticsDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'products',
      label: 'Designy',
      pageKey: 'numismatics_products', // klucz z rejestru stron
      component: <NumismaticProducts id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
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

export default NumismaticsPage;
