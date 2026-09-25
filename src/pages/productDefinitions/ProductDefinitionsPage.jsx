
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import ProductDefinitionsDetails from './ProductDefinitionsDetails';

const ProductDefinitionsPage = ({
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
      pageKey: 'product_definitions', // klucz z rejestru stron
      component: <ProductDefinitionsDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
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

export default ProductDefinitionsPage;
