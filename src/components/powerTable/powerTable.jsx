import React, { useState } from 'react';
import { Box, Backdrop, CircularProgress } from '@mui/material';

import useAutoColumns from './hooks/useAutoColumns';
import usePresets from './hooks/usePresets';
import useColumns from './hooks/useColumns';
import useTableSettings from './hooks/useTableSettings';

import { sortData } from './utils';
import { applyFilters } from './filterEngine';   // 👈 import
import { exportToXLSWithSchema } from '../../utils/exportToXLS';

import SettingsModal from './settingsModal';
import PowerSidebar from './powerSidebar';
import FlatTable from './flatTable';
import GroupedTable from './groupedTable';
import PresetsModal from './presetsModal';
import FormulaModal from './formula/formulaModal';

const PowerTable = ({
  data = [],
  columnSchema = [],
  rowRules = [],
  sidebarConfig = [],
  footerConfig = {},
  entityName = 'default',
  width = 1500,
  height = 600,
  loading = false,
  onRefresh
}) => {
  const presets = usePresets({ entityName });
  const autoColumns = useAutoColumns(data);
  const columnsSchema = useColumns({ autoColumns, devSchema: columnSchema, presets, entityName });

  const { settings, updateSettings } = useTableSettings(entityName);

  const [modalState, setModalState] = useState({ open: false, view: null });
  const [globalSearch, setGlobalSearch] = useState('');  // 👈 slug search

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
        );
      case 'custom':
        return (
          <FormulaModal
            open={modalState.open}
            onClose={closeModal}
            columns={columnsSchema}
          />
        );
      default:
        return null;
    }
  };

  // 🔑 Filtrowanie → Sortowanie
  const filteredData = applyFilters(data, columnsSchema.columns, globalSearch);
  const sortedData = sortData(filteredData, columnsSchema.sortModel, columnsSchema.columns);

  const { getGroupedCols } = columnsSchema;
  const isGrouped = getGroupedCols().length;

  const handleExport = () => {
    exportToXLSWithSchema(filteredData, columnsSchema.columns, `${entityName}.xlsx`);
  };

  const renderTable = () =>
    isGrouped ? (
      <GroupedTable
        data={filteredData}
        columnsSchema={columnsSchema}
        rowRules={rowRules}
        settings={settings}
        footerConfig={footerConfig}
      />
    ) : (
      <FlatTable
        data={sortedData}
        columnsSchema={columnsSchema}
        rowRules={rowRules}
        footerConfig={footerConfig}
        settings={settings}
      />
    );

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          height,
          width,
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
          config={sidebarConfig}
          onOpenSettings={openModal}
          columnsSchema={columnsSchema}
          presets={presets}
          onExport={handleExport}
          onRefresh={onRefresh}
          // 👇 tu potem przekażemy info o filtrach
          filtersActive={columnsSchema.hasAnyFilters()}
          onGlobalSearch={setGlobalSearch}
        />

        {/* Table Section */}
        <Box sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {renderTable()}
        </Box>
      </Box>

      {renderModalContent()}

      {loading && (
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </>
  );
};

export default PowerTable;
