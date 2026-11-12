
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import ProductDetails from './ProductDetails';
import ProductOrders from './ProductOrders';
import AddProductOrder from '../productOrder/AddProductOrder';
import AddProduct from './AddProduct';

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
    {
      key: 'orders',
      label: 'Zamówienia',
      pageKey: 'orders', // klucz z rejestru stron
      component: <ProductOrders id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'addorder',
      label: 'Dodaj Zamówienie',
      pageKey: 'addOrder', // klucz z rejestru stron
      component: <AddProductOrder data={{product_id : id, contractor_id: row.contractor_id}} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'adddesign',
      label: 'Dodaj Projekt',
      pageKey: 'addDesign', // klucz z rejestru stron
      component: <AddProduct data={{numismatic_id : row.numismatic_id, contractor_id: row.contractor_id, structure_id : row.structure_id, type_id: row.type_id}} productEntity={entity} rwd={rwd} dashboard={dashboard} />,
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
