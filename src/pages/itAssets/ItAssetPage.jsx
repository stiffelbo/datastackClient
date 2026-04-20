import React from 'react';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

import ItAssetDetails from './ItAssetDetails';
import ItAssetShifts from './ItAssetShifts';

const ItAssetPage = ({
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
    const tabs = [
        {
            key: 'details',
            label: 'Edytuj',
            pageKey: 'it_asset_details', // klucz z rejestru stron
            component: <ItAssetDetails id={id} row={row} rwd={rwd} entity={entity} dashboard={dashboard} />,
        }
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
            heightSpan={entity.heightSpan}
            headerFields={['typeName', 'brand', 'model', 'serial_number']}
        />
    );
}

export default ItAssetPage;