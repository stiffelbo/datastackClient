import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

import WhInventoryOperationDetails from './WhInventoryOperationDetails';
import WhInventoryOperationItems from './WhInventoryOperationItems';

const WhInventoryOperationPage = ({
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
            pageKey: 'wh_inventory_operation_details', // klucz z rejestru stron
            component: <WhInventoryOperationDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
        },
        {
            key: 'items',
            label: 'Zawartość',
            pageKey: 'wh_inventory_operation_items', // klucz z rejestru stron
            component: <WhInventoryOperationItems id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
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

export default WhInventoryOperationPage;
