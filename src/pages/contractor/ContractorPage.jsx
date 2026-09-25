
import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';
import ContractorDetails from './ContractorDetails';
import ContractorIssues from './ContractorIssues';

const BlankComponent = (props) => {
    return <div>
        <p>Blank Komponent</p>
        <pre>{JSON.stringify(props)}</pre>
    </div>
}

const ContractorPage = ({
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
      pageKey: 'contractor.details', // klucz z rejestru stron
      component: <ContractorDetails id={id} row={row} entity={entity}/>,
    },
    {
      key: 'issues',
      label: 'Projekty',
      pageKey: 'contractor.issues', // klucz z rejestru stron
      component: <ContractorIssues id={id} row={row} entity={entity} rwd={rwd}/>,
    },
    // itd...
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
      headerFields={['label', 'country']}
    />
  );
};

export default ContractorPage;
