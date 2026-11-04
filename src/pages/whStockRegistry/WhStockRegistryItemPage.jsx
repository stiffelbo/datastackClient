import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

const WhStockRegistryItemPage = ({
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

export default WhStockRegistryItemPage;
