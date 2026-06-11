// pages/Employees/PageUser.jsx
import React, { useCallback } from 'react';
import { Box } from '@mui/material';

import useEntity from '../../hooks/useEntity';

import PowerTable from '../../components/powerTable/powerTable';

const defaultRwd = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const MachineResources = ({ id = null, data = {}, rwd = defaultRwd }) => {

  const entityName = "MachinesResources";
  const endpoint = "/resources/";

  const entity = useEntity({ entityName, endpoint, query: { machine_id: id} });

  const effectiveHeight = rwd.height - 166;

  return (
    <PowerTable
      entityName={entityName}
      width={rwd.width}
      height={effectiveHeight}
      rowHeight={45}
      loading={entity.loading}
      data={entity.rows}
      columnSchema={entity.schema.columns}

      addFormSchema={null}
      addFormInitialValues={null}
      bulkEditFormSchema={null}
      importSchema={null}

      onRefresh={entity.refresh}
      onPost={null}
      onEdit={null}
      onUpload={null}
      onBulkEdit={null}
      onDelete={null}
      onBulkDelete={null}

      error={entity.error}
      clearError={entity.clearError}

      selected={null}
      onSelect={null}
      selectedItems={null}
      onSelectItems={null}
    />
  );
};

export default MachineResources;
