import React, {useState} from 'react';
import { Alert, Box, IconButton, Tooltip, CircularProgress, Stack, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import PowerTable from '../../../components/powerTable/powerTable';
import {kpiSchema} from './dto/tasksDto';

const ProductionTasksList = ({ production, rwd = {}}) => {
    const listHeight = rwd.height - 240;
    const tasks = [...(production.tasks ?? [])].sort((a, b) => (a.sequence_no ?? 0) - (b.sequence_no ?? 0));
    const kpiCols = kpiSchema();
    const columns = [...production?.schema?.columns.map(c => {
            if(c?.field === "sequence_no") {
                return c;
            }else{
                return c;
            }
        }), ...kpiCols];
        
    return (
        <Box sx={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
          <PowerTable 
            entityName='ProductOrderProductionTasks'
            data={tasks}
            columnSchema={columns}
            height={listHeight}
            onRefresh={production.refresh}
            onEdit={production.actions.update}
            selected={production.ui.selectedTaskId}
            onSelect={production.ui.selectTask}
            rowHeight={80}
          />
        </Box>
    );
};
export default ProductionTasksList;
