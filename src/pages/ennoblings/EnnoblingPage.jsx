
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';
import EnnoblingDetails from './EnnoblingDetails';
import EnnoblingStats from './EnnoblingStats';

const BlankComponent = (props) => {
    return <div>
        <p>Blank Komponent</p>
        <pre>{JSON.stringify(props)}</pre>
    </div>
}

const EnnoblingPage = ({
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
      pageKey: 'ennoblings.details', // klucz z rejestru stron
      component: <EnnoblingDetails id={id} row={row} entity={entity}/>,
    },
    {
      key: 'stats',
      label: 'Statystyki',
      pageKey: 'ennoblings.stats', // klucz z rejestru stron
      component: <EnnoblingStats id={id} row={row} entity={entity} rwd={rwd}/>,
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
      headerFields={['name', 'code']}
    />
  );
};

export default EnnoblingPage;
