import React, { useCallback } from 'react';
import { Box } from '@mui/material';

//Components
import PowerTable from '../../components/powerTable/powerTable';

import useEntity from '../../hooks/useEntity';

const defaultRwd = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//Page setup

const entityName = "Processes";
const heightOffset = 180;


const StructureProcesses = ({ id = null, data = {}, rwd = defaultRwd }) => {
    const employeesEntity = useEntity({
        endpoint: '/processes/',
        entityName,
        query: { structure_id: id },
    });

    return (
        <Box sx={{height: '100%', width: '100%'}}>
           <PowerTable
                entityName={"StructurePage_Processes"}
                width={'100%'}
                height={rwd.height - heightOffset}
                rowHeight={45}
                loading={employeesEntity.loading}
                data={employeesEntity.rows}
                columnSchema={employeesEntity.schema.columns}
                schemaVersion={employeesEntity.schemaVersion}
                
                addFormSchema={null}
                bulkEditFormSchema={null}
                importSchema={null}
                
                onRefresh={employeesEntity.refresh}
                onPost={null}
                onEdit={employeesEntity.updateField}
                onUpload={null}
                onBulkEdit={null}
                onDelete={null}
                onBulkDelete={null}      

                error={employeesEntity.error}
                clearError={employeesEntity.clearError}

                selected={null}
                onSelect={null}
            />
        </Box>
    );  
}

export default StructureProcesses;  