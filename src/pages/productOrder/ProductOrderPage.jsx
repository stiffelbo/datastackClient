
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import ProductOrderDetails from './ProductOrderDetails';
import ProductDetailsWrapper from './ProductDetailsWrapper';

const ProductOrderPage = ({
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
      pageKey: 'product_order', // klucz z rejestru stron
      component: <ProductOrderDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'design',
      label: 'Design',
      pageKey: 'product_order.design', // klucz z rejestru stron
      component: <ProductDetailsWrapper id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
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
      headerFields={['productType', 'design', 'qty_todo']}
    />
  );
};

export default ProductOrderPage;
