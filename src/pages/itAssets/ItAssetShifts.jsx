import React from 'react';

import useEntity from '../../hooks/useEntity';

import { Stack } from '@mui/material';

import ShiftToUserForm from './ShiftToUserForm';
import RenderShifts from './RednerShifts';
import useAssetShifts from './useAssetShifts';

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
    });

    const assetShifts = useAssetShifts({
        assetId: id,
        asset: row,
        shiftsEntity,
        employeesEntity,
        assetEntity: entity,
    });

    return (
        <Stack spacing={2}>
            {assetShifts.error && (
                <Alert severity="error">
                    {assetShifts.error?.message || 'Wystąpił błąd obsługi wydań assetu.'}
                </Alert>
            )}

            <ShiftToUserForm shifts={assetShifts} />

            <RenderShifts shifts={assetShifts} />
        </Stack>
    );

}

export default ItAssetShifts;