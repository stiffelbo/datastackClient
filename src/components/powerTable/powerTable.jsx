import React, { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

import useAutoColumns from './hooks/useAutoColumns';
import { useSelection } from './hooks/useSelection';
import usePresets from './hooks/usePresets';
import useColumns from './hooks/useColumns';
import useTableSettings from './hooks/useTableSettings';
import useTableEditing from './hooks/useTableEditing';

import { sortData } from './utils';
import { applyFilters } from './filter/utils';
import { exportToXLSWithSchema } from './utils';

import PowerSidebar from './powerSidebar';
import FlatTable from './flatTable';
import GroupedTableV from './groupedTableV';

import SettingsModal from './settingsModal';
import PresetsModal from './presetsModal';
import BulkFormModal from './bulkFormModal';
import UploadModal from './uploadModal';
import AddFormModal from './addFormModal';

const V_N_COUNT = 10000;

const PowerTable = ({
  //misc
  entityName = 'default',
  width = 1500,
  height = 600,
  loading = false,
  //core table
  data = [],
  columnSchema = [],
  //Form Schemas
  addFormSchema = {label : '', schema: [] },
  bulkEditFormSchema = {label : '', schema: [] },
  importSchema = null,
  //Crud Callbacks
  onRefresh,
  onPost = null,
  onEdit = null,
  onUpload= null,
  onBulkEdit = null,
  onDelete = null,
  onBulkDelete = null,
  //Entity HTTP Errrors
  error = null,
  clearError = null,
  //Select
  selected = null,
  onSelect = null,
  selectedItems = [],
  onSelectItems = null
}) => {

  const devColumnsLookup = {};
  if(Array.isArray(columnSchema)){
    columnSchema.forEach(col => devColumnsLookup[col.field] = col);
  }

  const presets = usePresets({ entityName });
  const actionsApi = useSelection({onSelect, selectedInit : selected, onSelectItems, selectedItems, onDelete, onBulkEdit, onBulkDelete});
  const autoColumns = useAutoColumns(data, devColumnsLookup);

  const columnsSchema = useColumns({ autoColumns, devSchema: columnSchema, presets, entityName, columnActions: actionsApi.columnActions });
  const editing = useTableEditing(onEdit);

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
      case 'addForm':
        return (
          <AddFormModal
            open={modalState.open}
            onClose={closeModal}
            addFormSchema={addFormSchema}
            onPost={onPost}
            error={error}
            clearError={clearError}
          />
        )
      case 'bulkForm':
        return (
          <BulkFormModal
            open={modalState.open}
            onClose={closeModal}
            actionsApi={actionsApi}
            bulkEditFormSchema={bulkEditFormSchema}
            onBulkEdit={onBulkEdit}
            entityName={entityName}
            error={error}
            clearError={clearError}
          />
        )
      case 'uploadData':
        return (
          <UploadModal
            open={modalState.open}
            onClose={closeModal}
            importSchema={importSchema}
            onUpload={onUpload}
            entityName={entityName}
            error={error}
            clearError={clearError}
            loading={loading}
          />
        )
      case 'form':
        return (
          form({ onClose: closeModal })
        );
      default:
        return null;
    }
  };

  // 🔑 Filtrowanie → Sortowanie
  const filteredData = applyFilters({ data: data, columnsSchema: columnsSchema, omit: [], selectedIds: actionsApi.selectedIds });
  const sortedData = sortData(filteredData, columnsSchema.sortModel, columnsSchema.columns);

  const cellNodes = (filteredData?.length * columnsSchema?.getVisibleColumns()?.length);
  const isVirtualized = cellNodes > V_N_COUNT ? true : false;

  const { getGroupedCols } = columnsSchema;
  const isGrouped = getGroupedCols().length;

  const handleExport = () => {
    exportToXLSWithSchema(filteredData, columnsSchema.columns, `${entityName}.xlsx`);
  };

  const renderTable = () =>
    isGrouped ? (
      <GroupedTableV
        initialData={data}
        data={filteredData}
        columnsSchema={columnsSchema}
        settings={{ height }}
        editing={editing}
        actionsApi={actionsApi}
      />
    ) : (
      <FlatTable
        initialData={data}
        data={sortedData}
        columnsSchema={columnsSchema}
        isVirtualized={isVirtualized}
        height={height}
        editing={editing}
        actionsApi={actionsApi}
      />
    );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          height,
          width,
          maxWidth: width,
          overflow: "hidden",
          overflowX: "scroll",
          marginRight: "1em",
          bgcolor:
            settings.background === "light"
              ? "#f9f9f9"
              : settings.background === "dark"
                ? "#1e1e1e"
                : "transparent",
        }}
      >
        {/* Sidebar */}
        <PowerSidebar
          onOpenSettings={openModal}
          presets={presets}
          columnsSchema={columnsSchema}
          actionsApi={actionsApi}
          onExport={handleExport}
          onRefresh={onRefresh}
          onBulkDelete={onBulkDelete}
          loading={loading}
          bulkEdit={Array.isArray(bulkEditFormSchema?.schema)}
          allowUpload={(importSchema && typeof onUpload === 'function')}
          allowAdd={(addFormSchema && typeof onPost === 'function')}
        />

        {/* Table Section */}
        <Box
          sx={{
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative", // <-- pozwala overlayowi przykryć tylko tę sekcję
          }}
          aria-busy={loading ? true : undefined}
        >
          {renderTable()}

          {/* Overlay spinner - wyświetlany tylko nad sekcją tabeli */}
          {loading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                pointerEvents: "all", // blokuje interakcje z tabelą
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CircularProgress color="primary" />
                {/* Opcjonalny tekst pod spinnerem — zakomentuj/usun jeśli nie chcesz */}
                <Typography variant="caption" sx={{ mt: 0.5 }}>
                  Ładowanie...
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {renderModalContent()}
    </>
  );
};

export default PowerTable;
