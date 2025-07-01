// powerTable.jsx
import React, { useState } from 'react';
import { Box, TableContainer, Table, Paper } from '@mui/material';

import useAutoColumns from './hooks/useAutoColumns';
import useColumnSchema from './hooks/useColumnSchema';
import useTableSettings from './hooks/useTableSettings';

import { sortData } from './utils';

import SettingsModal from './settingsModal';
import PowerTableHead from './powerTableHead';
import PowerTableBody from './powerTableBody';
import PowerTableFooter from './powerTableFooter';
import PowerSidebar from './powerSidebar';
import PowerTableControl from './powerTableControl';


const PowerTable = ({
  data = [],
  columnSchema = [],
  rowRules = [],
  sidebarConfig = [],
  footerConfig = {},
  entityName = 'default',
  width = 500,
  height = 500,
}) => {
  const autoColumns = useAutoColumns(data);
  const columnsSchema = useColumnSchema(autoColumns, columnSchema, entityName);

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
      default:
        return null;
    }
  };

  const sortedData = sortData(data, columnsSchema.sortModel, columnsSchema.columns);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          height,
          width,
          overflow: 'hidden',
          bgcolor:
            settings.background === 'light'
              ? '#f9f9f9'
              : settings.background === 'dark'
                ? '#1e1e1e'
                : 'transparent',
        }}
      >
        {/* Sidebar */}
        <PowerSidebar config={sidebarConfig} onOpenSettings={() => openModal('settings')} columnsSchema={columnsSchema} />

        {/* Table Section */}
        <Box sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Control bar: wysokość naturalna */}
          <PowerTableControl columnsSchema={columnsSchema} />

          {/* Tabela: rośnie, scrolluje się */}
          <Box sx={{ flex: '1 1 auto', overflow: 'auto' }}>
            <TableContainer component={Paper} sx={{ maxHeight: '100%', width: '100%', maxWidth: '100%' }}>
              <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
                <PowerTableHead columnsSchema={columnsSchema} settings={settings} />
                <PowerTableBody data={sortedData} columnsSchema={columnsSchema} rowRules={rowRules} settings={settings} />
                <PowerTableFooter data={sortedData} columnsSchema={columnsSchema} config={footerConfig} settings={settings} />
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>

      {renderModalContent()}
    </>
  );
};

export default PowerTable;
