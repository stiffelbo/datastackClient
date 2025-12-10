import React from 'react';

import BaseEntityPage from '../../components/dashboard/BaseEntityPage';
import PageAccessViewFields from './PageAccessViewFields';
import PageAccessEditFields from './PageAccesEditFields';

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
            component: <PageAccessViewFields id={id} row={row} rwd={rwd} />,
        },
        {
            key: 'editFields',
            label: 'Pola Bez Edycji',
            pageKey: 'page_access.edit_fields', // klucz z rejestru stron
            component: <PageAccessEditFields id={id} row={row} rwd={rwd} />,
        },
        // itd...
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
        />
    );
};

export default PageAccessPage;