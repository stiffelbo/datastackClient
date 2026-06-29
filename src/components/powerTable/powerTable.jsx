import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

import useAutoColumns from './hooks/useAutoColumns';
import { useRowAction } from './hooks/useRowAction';
import usePresets from './hooks/usePresets';
import useColumns from './hooks/useColumns';
import useTableEditing from './hooks/useTableEditing';

import { sortData } from './utils';
import { applyFilters } from './filter/utils';
import { exportToXLSWithSchema } from './utils';

import PowerSidebar from './powerSidebar';
import FlatTable from './flatTable';
import GroupedTableV from './groupedTableV';
import TreeTableV from './treeTableV';

import PresetsModal from './presetsModal';
import BulkFormModal from './bulkFormModal';
import UploadModal from './uploadModal';
import AddFormModal from './addFormModal';

const V_N_COUNT = 6000;

const defaultTree = {
  enabled: false,
  canDisable: true,
  parentField: 'parent_id',
  idField: 'id',
  rootValue: null, //jak jest null w parrent_id to znaczy ze wiersz jest rootem
};

const PowerTable = ({
  //misc
  entityName = 'default',
  width = 1500,
  height = 600,
  rowHeight = 45,
  loading = false,
  //core table
  data = [],
  columnSchema = [],
  strictSchema = false,
  schemaVersion = 0,
  treeConfig = defaultTree,
  //Form Schemas
  addFormSchema = { label: '', schema: [] },
  addFormInitialValues = {},
  bulkEditFormSchema = { label: '', schema: [] },
  importSchema = null,
  //Crud Callbacks
  onRefresh,
  onPost = null,
  onEdit = null,
  onUpload = null,
  onBulkEdit = null,
  onDelete = null,
  onBulkDelete = null,
  //Entity HTTP Errrors
  error = null,
  clearError = null,
  //Select
  selected = null,
  onSelect = null,
  onFilter = null,

  //Utitlity Controls
  enablePresets = true,
  enableUpload = true,
  enableExport = true,
  showSidebar = true,
}) => {

  const devColumnsLookup = {};
  if (Array.isArray(columnSchema)) {
    columnSchema.forEach(col => devColumnsLookup[col.field] = col);
  }

  const defaultTableConfig = {
    rowHeight,
    width,
    height,
    fontSize: '13px'
  };

  const presets = usePresets({ entityName, enablePresets, treeConfig, tableConfig : defaultTableConfig});
  const actionsApi = useRowAction({ onSelect, selected, onDelete, onBulkEdit, onBulkDelete });
  const autoColumns = useAutoColumns({ data, dev: devColumnsLookup, enableEdit: !!onEdit, strictSchema: strictSchema });

  const columnsSchema = useColumns({ autoColumns, devSchema: columnSchema, presets, entityName, columnActions: actionsApi.columnActions, schemaVersion });
  const editing = useTableEditing(onEdit);

  const [modalState, setModalState] = useState({ open: false, view: null });

  const openModal = (view) => setModalState({ open: true, view });
  const closeModal = () => setModalState({ open: false, view: null });

  const renderModalContent = () => {
    switch (modalState.view) {
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
            initialValues={addFormInitialValues}
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
  const filteredData = useMemo(() => {
    return applyFilters({
      data,
      columnsSchema,
      omit: [],
      selectedIds: actionsApi.selectedIds,
    });
  }, [data, columnsSchema, actionsApi.selectedIds]);

  useEffect(() => {
    if (typeof onFilter === 'function') {
      onFilter(filteredData);
    }
  }, [onFilter, filteredData]);

  const sortedData = useMemo(() => {
    return sortData(
      filteredData,
      columnsSchema.sortModel,
      columnsSchema.columns
    );
  }, [filteredData, columnsSchema.sortModel, columnsSchema.columns]);

  const cellNodes = (filteredData?.length * columnsSchema?.getVisibleColumns()?.length);
  const isVirtualized = cellNodes > V_N_COUNT ? true : false;

  const { getGroupedCols } = columnsSchema;
  const isGrouped = getGroupedCols().length;

  const handleExport = () => {
    exportToXLSWithSchema(filteredData, columnsSchema.columns, `${entityName}.xlsx`);
  };
  const isTree = !!treeConfig.enabled && !isGrouped; // jeśli chcesz, żeby grupowanie miało priorytet

  const settingsWithTree = {
    isTree,
    treeColumnWidth: 140,
    treeIndentStep: 2,
    height,
    rowHeight : rowHeight,
    isVirtualized
  };

  const tableKey = `${entityName}:${schemaVersion}:${isGrouped ? 'g' : 'n'}:${isTree ? 't' : 'n'}`;

  const renderTable = () =>
    isGrouped ? (
      <GroupedTableV
        key={tableKey}
        initialData={data}
        data={filteredData}
        columnsSchema={columnsSchema}
        height={height}
        settings={settingsWithTree}
        editing={editing}
        actionsApi={actionsApi}
      />
    ) : isTree ? (
      <TreeTableV
        key={tableKey}
        initialData={data}
        data={sortedData}
        columnsSchema={columnsSchema}
        height={height}
        settings={settingsWithTree}
        treeConfig={treeConfig}
        editing={editing}
        actionsApi={actionsApi}
      />
    ) : (
      <FlatTable
        key={tableKey}
        initialData={data}
        data={sortedData}
        columnsSchema={columnsSchema}
        isVirtualized={isVirtualized}
        height={height}
        settings={settingsWithTree}
        editing={editing}
        actionsApi={actionsApi}
      />
    );

  if (data === null) {
    return <Alert severity="info">Brak danych dla PowerTable w {entityName}</Alert>;
  }
  if (data === undefined) {
    return <Alert severity="warning">Prop Data jest undefined w PowerTable {entityName}</Alert>;
  }

  const renderSidebar = () => {
    if (!showSidebar) return null;

    return (
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
        showExport={enableExport}
        showUpload={(importSchema && typeof onUpload === 'function') && enableUpload}
        showAdd={(addFormSchema && typeof onPost === 'function')}
        showPresets={enablePresets}
      />
    );
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          height,
          width: '100%',          // ⬅️ zawsze wypełnia rodzica
          maxWidth: '100%',
          overflow: 'hidden',
          bgcolor:
            '#f9f9f9'
        }}
      >
        {/* Sidebar (opcjonalnie) */}
        {showSidebar && (
          <Box
            sx={{
              flex: '0 0 auto',
              // szerokość trzymasz w samym PowerSidebar (ikonki)
            }}
          >
            {renderSidebar()}
          </Box>
        )}

        {/* Sekcja tabeli */}
        <Box
          sx={{
            flex: '1 1 auto',
            minWidth: 0,
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
          }}
          aria-busy={loading ? true : undefined}
        >
          {/* Wewnętrzny kontener na poziomy scroll tabeli */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
            }}
          >
            {renderTable()}
          </Box>

          {/* Overlay spinner - tylko nad sekcją tabeli */}
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                pointerEvents: 'all',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <CircularProgress color="primary" />
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
}

export default PowerTable;
