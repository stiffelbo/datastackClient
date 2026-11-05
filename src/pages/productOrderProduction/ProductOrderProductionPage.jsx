
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import ProductOrderDetails from '../productOrder/ProductOrderDetails';
import ProductDetailsWrapper from '../productOrder/ProductDetailsWrapper';
import ProductOrderShift from '../productOrder/ProductOrderShift';
import ProductOrderReturnShift from '../productOrder/ProductOrderReturnShift';
import ProductOrderShifts from '../productOrder/ProductOrderShifts';
import ProductOrderDocuments from '../productOrder/ProductOrderDocuments';

const ProductOrderProductionPage = ({
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
      pageKey: 'productorderproductio', // klucz z rejestru stron
      component: <ProductOrderDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'design',
      label: 'Design',
      pageKey: 'productorderproductio.design', // klucz z rejestru stron
      component: <ProductDetailsWrapper id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'shift',
      label: 'Wydaj na produkcje',
      pageKey: 'productorderproductio.shift', // klucz z rejestru stron
      component: <ProductOrderShift id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'returnshift',
      label: 'Przyjmij z produkcji',
      pageKey: 'product_order.returnshift', // klucz z rejestru stron
      component: <ProductOrderReturnShift id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'shifts',
      label: 'Wydania',
      pageKey: 'productorderproductio.shifts', // klucz z rejestru stron
      component: <ProductOrderShifts id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'documents',
      label: 'Dokumenty',
      pageKey: 'productorderproductio.documents', // klucz z rejestru stron
      component: <ProductOrderDocuments id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
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

export default ProductOrderProductionPage;
