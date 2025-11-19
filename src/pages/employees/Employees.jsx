import React from 'react';

// Hooks
import useEntity from '../../hooks/useEntity';
import {useRwd} from '../../context/RwdContext';
import useDashboardState from '../../hooks/useDashboardState';

// Comp
import PowerTable from '../../components/powerTable/powerTable';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import BaseEntityPage from '../../components/dashboard/BaseEntityPage';

const entityName = 'Employees';

const Employees = () => {
  const { width, height } = useRwd(); // RWD z poziomu app
  const entity = useEntity({ endpoint: '/employees/' });

  const {
    currentId,
    setCurrentId,
    tab,
    setTab,
  } = useDashboardState({ entityName });

  const selectedRow =
    currentId != null
      ? entity.rows?.find((r) => +r.id === +currentId)
      : null;

  const showRight = !!selectedRow;

  const listNode = (
    <PowerTable
      entityName={entityName}
      width={width}
      height={height - 90}
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
      selectedItems={[]}
      onSelectItems={null}
      // selectedItems / onSelectItems możesz dalej obsłużyć jeśli potrzebne
    />
  );

  const pageNode = showRight ? (
    <BaseEntityPage
      entityName={entityName}
      id={currentId}
      row={selectedRow}
      rows={entity.rows}
      schema={entity.schema}
      tab={tab}
      setTab={setTab}
      onChangeId={setCurrentId}
    />
  ) : null;

  return (
    <DashboardLayout
      showRight={showRight}
      left={listNode}
      right={pageNode}
      initialLeftRatio={0.4}
      minLeftRatio={0.2}
      maxLeftRatio={0.8}
      onResizeEnd={(ratio) => {
        // TODO: później zapiszesz to w userPages / localStorage
        console.log('Employees leftRatio:', ratio);
      }}
    />
  );
};

export default Employees;
