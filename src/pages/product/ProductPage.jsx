
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import ProductDetails from './ProductDetails';

const ProductPage = ({
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
      pageKey: 'product', // klucz z rejestru stron
      component: <ProductDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
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
      headerFields={['slug', 'brand', 'model']}
    />
  );
};

export default ProductPage;
