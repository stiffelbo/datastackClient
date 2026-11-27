
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';
import PriceListDetails from './PriceListDetails';
import PriceListContent from './PriceListContent';
import PriceListStats from './PriceListStats';

const BlankComponent = (props) => {
    return <div>
        <p>Blank Komponent</p>
        <pre>{JSON.stringify(props)}</pre>
    </div>
}

const PriceListPage = ({
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
      label: 'Edytuj',
      pageKey: 'priceLists.details', // klucz z rejestru stron
      component: <PriceListDetails id={id} row={row} entity={entity} dashboard={dashboard}/>,
    },
    {
      key: 'items',
      label: 'Pozycje',
      pageKey: 'priceLists.items', // klucz z rejestru stron
      component: <PriceListContent id={id} row={row} entity={entity} dashboard={dashboard} rwd={rwd}/>,
    },
    {
      key: 'stats',
      label: 'Statystyki',
      pageKey: 'priceLists.stats', // klucz z rejestru stron
      component: <PriceListStats id={id} row={row} entity={entity} dashboard={dashboard} rwd={rwd}/>,
    },
  ]

  return (
    <BaseEntityPage
      entityName={entityName}
      id={id}
      rows={rows}
      row={row}
      onChangeId={onChangeId}
      tabs={tabs}
      tab={tab}
      rwd={rwd}
      setTab={setTab}
      heightSpan={entity.heightSpan}
      headerFields={['name']}
    />
  );
};

export default PriceListPage;
