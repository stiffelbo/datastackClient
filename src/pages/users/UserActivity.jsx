
import React from 'react';

import { Alert } from '@mui/material';

import ApiLoader from '../../components/ApiLoader';
import PowerTable from '../../components/powerTable/powerTable';

const entityName = 'UserActivity';

const UserActivity = ({
    id = null,
    row,
    entity,
    rwd,
    dashboard,
    from = null,
    to = null,
}) => {
    if (!id) {
        return (
            <Alert severity="warning">
                Brak ID użytkownika do pobrania historii aktywności.
            </Alert>
        );
    }

    const urlData = `/user_activity/get.php?userId=${id}`;

    const processData = data => {
        return data;
    }

    return (
        <ApiLoader
            url={{ data: urlData }}
            entityName={entityName}
            deps={[id]}
            immediate={true}
        >
            <PowerTable
                entityName={entityName}
                data={data => processData(data)}
                height={rwd?.height ? rwd.height - 186 : 500}
                rowHeight={60}
            />
        </ApiLoader>
    );
};

export default UserActivity;
