import React from 'react';

import useEntity from '../../hooks/useEntity';

import { Stack } from '@mui/material';

const ItAssetShifts = ({ id = null, row = {}, rwd = defaultRwd, entity, dashboard }) => {

    const shiftsEntity = useEntity({
        endpoint: '/it_assets_shifts/',
        entityName: 'it_assets_shifts',
        query: { 'it_asset_id': id }
    });

    const employeesEntity = useEntity({
        endpoint: '/employees/',
        entityName: 'ItAssetEmployeesList',
        query: {'activeOptions' : true}
    })

    return <div>
        <pre>
            {JSON.stringify(shiftsEntity.rows)}
        </pre>
    </div>

}

export default ItAssetShifts;