import React from 'react';
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import DSLink from '../../components/powerTable/cell/DSLink';

const entityName = 'Board';
const basePath = "/board";
const endpoint = '/board/';

const Board = () => {
    const entity = useEntity({ entityName, endpoint, cacheHardKey : 'Board' });

    const columns = entity.schema.columns || [];
    columns.unshift(
        {
      "field": "link",
      "headerName" : 'Link',
      "width" : '120',
      "order" : 1,
      "renderCell" : params => <DSLink value={params.row.reference_id} column={{reference : params.row.reference, tab: params.row.tab}}/>
    });

    entity.schema.columns = columns;

     const getRowStyles = (row) => {
        const priority = !!row.priority;
        const active = !!row.is_active;

        if (priority) {
            return { backgroundColor: 'rgba(243, 33, 82, 0.06)' };
        }

        if (active) {
            return { backgroundColor: 'rgba(76, 132, 175, 0.07)' };
        }

        return {};
    };

    return (
        <BaseEntityDashboard
            renderPage={null}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
            refreshId={true}
            listProps={{
                addFormSchema: null,
                getRowStyles: getRowStyles,
            }}
        />
    );
};

export default Board;
