import React from 'react';

// Hooks
import useEntity from '../../hooks/useEntity';

// Components
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';

const entityName = "WhShifts";
const basePath = "/whshifts";
const endpoint = "/wh_shifts/";

const Dashboard = () => {
    const dashboardEntity = useEntity({ entityName, endpoint });
    /*
    const getRowStyles = (row) => {
        if (Number(row.is_done) === 0) return {
            backgroundColor: 'rgba(61, 61, 61, 0.04)',
            borderLeft: '3px solid rgba(126, 114, 114, 0.45)',
            '&:hover': {
                backgroundColor: 'rgba(120, 7, 7, 0.09)',
            },
        };
        return {};
    };
    */
    return (
        <BaseEntityDashboard
            renderPage={null}
            entity={dashboardEntity}
            entityName={entityName}
            basePath={basePath}
            listProps={{
                getRowStyles: null,
            }}
        />
    );
};

export default Dashboard;