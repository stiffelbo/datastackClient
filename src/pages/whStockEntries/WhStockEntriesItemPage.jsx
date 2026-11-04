import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

import WhStockEntriesDetails from './WhStockEntriesDetails';
import WhStockEntriesShift from './WhStockEntriesShift';
import WhStockEntriesShifts from './WhStockEntriesShifts';

const WhStockEntriesItemPage = ({
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

    // tu definicje tabsów i propsy dla subkomponentów
    const tabs = [
        {
            key: 'details',
            label: 'Szczegóły',
            pageKey: 'wh_shipping_item_details', // klucz z rejestru stron
            component: <WhStockEntriesDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
        },
        {
            key: 'shift',
            label: 'Zleć wydanie na produkcje',
            pageKey: 'wh_shipping_item_shifts', // klucz z rejestru stron
            component: <WhStockEntriesShift id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
        },
        {
            key: 'shifts',
            label: 'Wydania',
            pageKey: 'wh_shipping_item_shifts', // klucz z rejestru stron
            component: <WhStockEntriesShifts id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
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
            headerFields={['title']}
        />
    );
};

export default WhStockEntriesItemPage;
