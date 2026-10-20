import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

import WhShippingDetails from './WhShippingDetails';

const WhShippingPage = ({
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
            pageKey: 'wh_shipping_details', // klucz z rejestru stron
            component: <WhShippingDetails id={id} row={row} entity={entity} rwd={rwd} dashboard={dashboard} />,
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
            headerFields={['name', 'category']}
        />
    );
};

export default WhShippingPage;
