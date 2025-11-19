// dashboard/BaseEntityDashboard.jsx
import React from 'react';
import DashboardLayout from './DashboardLayout';
import useEntity from '../../hooks/useEntity';
import PowerTable from '../../components/powerTable/powerTable';
import BaseEntityPage from './BaseEntityPage';
import useDashboardState from '../../hooks/useDashboardState';

const BaseEntityDashboard = ({
  entityName,
  endpoint,
  width,
  height,
  renderPage,
  tableProps = {},
}) => {
  const ds = useDashboardState({ entityName });
  const { currentId, setCurrentId, viewMode, filters, setFilter, tab, setTab } = ds;

  const entity = useEntity({ endpoint });

  const selectedRow =
    currentId != null
      ? entity.rows?.find(r => +r.id === +currentId)
      : null;

  const showRight = !!selectedRow;

  const pageNode = showRight && (
    renderPage ? (
      renderPage({
        id: currentId,
        row: selectedRow,
        rows: entity.rows,
        schema: entity.schema,
        onChangeId: setCurrentId,
        tab,
        setTab,
      })
    ) : (
      <BaseEntityPage
        id={currentId}
        row={selectedRow}
        rows={entity.rows}
        schema={entity.schema}
        entityName={entityName}
        tab={tab}
        setTab={setTab}
        onChangeId={setCurrentId}
      />
    )
  );

  // na razie tylko viewMode === 'table'; później dołożysz calendar/cards
  const listNode = (
    <PowerTable
      entityName={entityName}
      width={width}
      height={height}
      loading={entity.loading}
      data={entity.rows}
      columnSchema={entity.schema.columns}
      addFormSchema={entity.schema.addForm}
      bulkEditFormSchema={entity.schema.bulkEditForm}
      importSchema={entity.schema.importSchema}
      onRefresh={entity.refresh}
      onPost={entity.create}
      onEdit={entity.updateField}
      onUpload={entity.upload}
      onBulkEdit={entity.updateMany}
      onDelete={entity.remove}
      onBulkDelete={entity.removeMany}
      error={entity.error}
      clearError={entity.clearError}
      selected={currentId}
      onSelect={setCurrentId}
      // TODO: filtry można później spiąć z PowerTable / applyFilters
      {...tableProps}
    />
  );

  return (
    <DashboardLayout
      showRight={showRight}
      left={listNode}
      right={pageNode}
    />
  );
};

export default BaseEntityDashboard;
