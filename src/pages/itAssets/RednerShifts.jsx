import React from 'react';
import { Alert, Stack, Typography } from '@mui/material';

import ActiveShiftForm from './ActiveShiftForm';
import RenderClosedShifts from './RenderClosedShifts';

export default function RenderShifts({ shifts }) {
    if (!shifts) return null;

    const hasAny = (shifts.shifts || []).length > 0;

    if (!hasAny) {
        return (
            <Alert severity="info">
                Brak historii wydań dla tego assetu.
            </Alert>
        );
    }

    return (
        <Stack spacing={2}>
            {shifts.activeShift && (
                <Stack spacing={1}>
                    <Typography variant="h6">Aktywne wydanie</Typography>
                    <ActiveShiftForm
                        data={shifts.activeShift}
                        loading={shifts.saving}
                        onSubmit={shifts.closeShift}
                    />
                </Stack>
            )}

            <Stack spacing={1}>
                <Typography variant="h6">Historia wydań</Typography>

                {shifts.closedShifts?.length ? (
                    <RenderClosedShifts shifts={shifts.closedShifts} />
                ) : (
                    <Alert severity="info">
                        Brak zamkniętych wydań w historii.
                    </Alert>
                )}
            </Stack>
        </Stack>
    );
}