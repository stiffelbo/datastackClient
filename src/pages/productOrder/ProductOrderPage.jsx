
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

//Pages
import ProductOrderDetails from './ProductOrderDetails';
import ProductDetailsWrapper from './ProductDetailsWrapper';
import AddProductOrder from './AddProductOrder';
import ProductOrderShift from './ProductOrderShift';
import ProductOrderReturnShift from './ProductOrderReturnShift';
import ProductOrderShifts from './ProductOrderShifts';
import ProductOrderDocuments from './ProductOrderDocuments';
import ProductionTasksManager from '../jiraIssueProductionTasks/IssueProductionTasks/ProductionTasksManager';

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
    {
      key: 'addOrder',
      label: 'Reorder',
      pageKey: 'product_order.reorder',
      component: <AddProductOrder data={{product_id : row.product_id}} ordersEntity={entity} orderId={id} rwd={rwd}/>,
    },
    {
      key: 'productionTasks',
      label: 'Zadania',
      pageKey: 'product_order.tasks',
      component: <ProductionTasksManager product_order={row} issue={null}/>,
    },
    {
      key: 'shift',
      label: 'Wydaj na produkcje',
      pageKey: 'product_order.shift', // klucz z rejestru stron
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
      pageKey: 'product_order.shifts', // klucz z rejestru stron
      component: <ProductOrderShifts id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
    },
    {
      key: 'documents',
      label: 'Dokumenty',
      pageKey: 'product_order.documents', // klucz z rejestru stron
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

export default ProductOrderPage;
