import React from 'react';

import BaseEntityPage from '../../components/dashboard/BaseEntityPage';
import PageAccessFields from './PageAccessFields';

const PageAccessPage = ({
    entityName,
    entity,
    dashboard,
    id,
    row,
    rows,
    rwd,
    schema,
    onChangeId,
}) => {
    const { tab, setTab } = dashboard;

    // tu definicje tabsów i propsy dla subkomponentów
    const tabs = [
        {
            key: 'viewFields',
            label: 'Pola Ukryte',
            pageKey: 'page_access.view_fields', // klucz z rejestru stron
            component: <PageAccessFields id={id} row={row} rwd={rwd} entity={entity}/>,
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
            rwd={rwd}
            headerFields={['userName', 'pageName']}
        />
    );
};

export default PageAccessPage;