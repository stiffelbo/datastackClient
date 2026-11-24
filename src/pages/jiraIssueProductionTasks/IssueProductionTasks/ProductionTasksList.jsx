import React from 'react';
import { Box } from '@mui/material';

import PowerTable from '../../../components/powerTable/powerTable';
import ProductionTaskActions from './ProductionTaskActions';
import { kpiSchema } from './dto/tasksDto';

const ProductionTasksList = ({ production, rwd = {} }) => {
    const { actions, ui, schema, loading } = production;

    const listHeight = rwd.height - 230;

    const tasks = [...(production.tasks ?? [])].sort((a, b) => {
        return (a.sequence_no ?? 0) - (b.sequence_no ?? 0);
    });

    const actionsColumn = {
        field: '_actions',
        headerName: 'Operacje',
        type: 'string',
        width: 150,
        order: 2,
        editable: false,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => {
            return (
                <ProductionTaskActions
                    task={row}
                    actions={actions}
                    ui={ui}
                    disabled={loading}
                />
            );
        },
    };

    const columns = [
        actionsColumn,
        ...(schema?.columns ?? []),
        ...kpiSchema(),
    ];

    return (

            <PowerTable
                entityName="ProductOrderProductionTasks"
                data={tasks}
                columnSchema={columns}
                height={listHeight}
                onRefresh={production.refresh}
                onEdit={actions.update}
                onDelete={actions.remove}
                selected={ui.selectedTaskId}
                onSelect={ui.selectTask}
                rowHeight={80}
            />
    );
};

export default ProductionTasksList;