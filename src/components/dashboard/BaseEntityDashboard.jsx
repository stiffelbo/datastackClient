// components/dashboard/BaseEntityDashboard.jsx
import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

//Mui
import { Box, Typography } from '@mui/material';

import { useRwd } from '../../context/RwdContext';
import { useDashboard } from '../../context/DashboardContext';

import PowerTable from '../../components/powerTable/powerTable';
import DashboardLayout from './DashboardLayout';

const BaseEntityDashboard = ({
  entityName,
  entity,
  renderPage,   // <EmployeePage entity={entity} />
  basePath,// np. "/employees"
  listProps = {},
  refreshId = false
}) => {
  const { width, height } = useRwd();
  const dashboard = useDashboard(entityName);
  const { currentId, setCurrentId, tab, setTab } = dashboard;

  const rows = entity?.rows || [];
  const schema = entity?.schema || {};

  const selectedRow =
    currentId != null ? rows.find((r) => +r.id === +currentId) : null;

  const showRight = !!selectedRow;

  // --- URL sync ---
  const { id: urlId, tab: urlTab } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initializedRef = useRef(false);

  // 1) Na pierwsze wejście – zaciągamy id/tab z URL do stanu dashboardu
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (urlId) {
      setCurrentId(Number(urlId));
    }
    if (urlTab) {
      setTab(urlTab);
    }
  }, [urlId, urlTab, setCurrentId, setTab]);

  useEffect(()=>{
    if(refreshId){
      if(typeof entity.getOne === 'function'){
        entity.getOne(currentId);
      }
    }
  }, [currentId]);

  // 2) Na zmiany stanu dashboardu – aktualizujemy URL
  useEffect(() => {
    const base = basePath || `/${entityName.toLowerCase()}`;

    const segments = [base.replace(/\/+$/, '')]; // bez trailing slash

    if (currentId != null) {
      segments.push(String(currentId));
      if (tab) {
        segments.push(tab);
      }
    }

    const newPath = segments.join('/');

    if (location.pathname !== newPath) {
      navigate(newPath, { replace: true });
    }
  }, [basePath, entityName, currentId, tab, location.pathname, navigate]);

  // --- LISTA ---
  const listNode = (
    <PowerTable
      entityName={entityName}
      width={width}
      height={height - entity.heightSpan}
      rowHeight={45}
      loading={entity.loading}
      data={rows}
      columnSchema={schema.columns}
      
      addFormSchema={schema.addForm}
      bulkEditFormSchema={schema.bulkEditForm}
      importSchema={schema.importSchema}
      
      onRefresh={entity.refresh}
      onPost={entity.create}
      onEdit={entity.updateField}
      onUpload={entity.upload}
      onBulkEdit={entity.updateMany}
      onDelete={entity.remove}
      onBulkDelete={entity.removeMany}      

      error={entity.error}
      clearError={entity.clearError}

      selected={renderPage ? currentId : null}
      onSelect={renderPage ? setCurrentId : null}
      {...listProps}
    />
  );

  // --- STRONA ---
  let pageContent = null;

  if (showRight) {
    if (renderPage && typeof renderPage === 'function') {
      pageContent = renderPage({
        id: currentId,
        row: selectedRow,
        rows,
        schema,
        dashboard,
        rwd : {width, height},
        onChangeId: setCurrentId,
      });
    } else {
      pageContent = (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Brak dostępnych zakładek dla encji {entityName}.
          </Typography>
        </Box>
      );
    }
  }

  return (
    <DashboardLayout
      showRight={showRight}
      left={listNode}
      right={pageContent}
      initialLeftRatio={0.4}
      minLeftRatio={0.2}
      maxLeftRatio={0.8}
      onResizeEnd={(ratio) => {
        console.log(`[Dashboard][${entityName}] leftRatio:`, ratio);
      }}
    />
  );
};

export default BaseEntityDashboard;
