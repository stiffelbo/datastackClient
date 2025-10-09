import React, { useState } from 'react';
import { Box, Backdrop, CircularProgress } from '@mui/material';

import useAutoColumns from './hooks/useAutoColumns';
import usePresets from './hooks/usePresets';
import useColumns from './hooks/useColumns';
import useTableSettings from './hooks/useTableSettings';

import { sortData } from './utils';
import { applyFilters } from './filter/utils';
import { exportToXLSWithSchema } from '../../utils/exportToXLS';

import SettingsModal from './settingsModal';
import PowerSidebar from './powerSidebar';
import FlatTable from './flatTable';
import GroupedTable from './groupedTable';
import PresetsModal from './presetsModal';

const V_N_COUNT = 10000;

const PowerTable = ({
  data = [],
  columnSchema = [],
  entityName = 'default',
  width = 1500,
  height = 600,
  loading = false,
  onRefresh,
  //Form
  form = null
}) => {
  const presets = usePresets({ entityName });
  const autoColumns = useAutoColumns(data);
  const columnsSchema = useColumns({ autoColumns, devSchema: columnSchema, presets, entityName });

  const { settings, updateSettings } = useTableSettings(entityName);

  const [modalState, setModalState] = useState({ open: false, view: null });

  const openModal = (view) => setModalState({ open: true, view });
  const closeModal = () => setModalState({ open: false, view: null });

  const renderModalContent = () => {
    switch (modalState.view) {
      case 'settings':
        return (
          <SettingsModal
            open={modalState.open}
            onClose={closeModal}
            settings={settings}
            onSave={updateSettings}
          />
        );
      case 'presets':
        return (
          <PresetsModal
            open={modalState.open}
            onClose={closeModal}
            presets={presets}
            columns={columnsSchema}
          />
        )
      case 'form':
        return (
          form({onClose : closeModal})
        );
      default:
        return null;
    }
  };

  // 🔑 Filtrowanie → Sortowanie
  const filteredData = applyFilters(data, columnsSchema);
  const sortedData = sortData(filteredData, columnsSchema.sortModel, columnsSchema.columns);

  const cellNodes = (filteredData?.length * columnsSchema?.getVisibleColumns()?.length);
  const isVirtualized = cellNodes > V_N_COUNT ? true : false;

  console.log(cellNodes, isVirtualized);

  const { getGroupedCols } = columnsSchema;
  const isGrouped = getGroupedCols().length;

  const handleExport = () => {
    exportToXLSWithSchema(filteredData, columnsSchema.columns, `${entityName}.xlsx`);
  };

  const renderTable = () =>
    isGrouped ? (
      <GroupedTable
        initialData={data}
        data={filteredData}
        columnsSchema={columnsSchema}
        isVirtualized={isVirtualized}
      />
    ) : (
      <FlatTable
        initialData={data}
        data={sortedData}
        columnsSchema={columnsSchema}
        isVirtualized={isVirtualized}
        height={height}
      />
    );

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          height,
          width,
          maxWidth: width,
          overflow: 'hidden',
          overflowX: 'scroll',
          marginRight: '1em',
          bgcolor:
            settings.background === 'light'
              ? '#f9f9f9'
              : settings.background === 'dark'
              ? '#1e1e1e'
              : 'transparent',
        }}
      >
        {/* Sidebar */}
        <PowerSidebar
          onOpenSettings={openModal}
          columnsSchema={columnsSchema}
          presets={presets}
          onExport={handleExport}
          onRefresh={onRefresh}
        />

        {/* Table Section */}
        <Box sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {renderTable()}
        </Box>
      </Box>

      {renderModalContent()}

      {loading && (
          <CircularProgress color="inherit" />
      )}
    </>
  );
};

export default PowerTable;
