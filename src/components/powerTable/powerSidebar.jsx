// powerSidebar.jsx
import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Badge, Menu } from '@mui/material';

// Icons
import TuneIcon from '@mui/icons-material/Tune';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChecklistIcon from '@mui/icons-material/Checklist';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import AllFilters from './filter/allFilters';

const PowerSidebar = ({ onOpenSettings, columnsSchema, presets, actionsApi, onExport, onRefresh, onBulkDelete, loading, bulkEdit = false, showAdd = false, showUpload = false , showExport = false, showPresets = false}) => {

  const [anchorEl, setAnchorEl] = useState(null);

  const openSearch = (e) => setAnchorEl(e.currentTarget);
  const closeSearch = () => setAnchorEl(null);

  //Filters
  const renderSearchControl = () => {
    const allFilters = columnsSchema.getAllFilters();
    const activeFiltersCount = allFilters.length + (columnsSchema.globalSearch ? 1 : 0);
    const {globalSearch} = columnsSchema;

    const title = globalSearch ? `Fraza: ${globalSearch}` : 'Szukaj...';

    return (
      <>
        <Tooltip title={title}>
          <IconButton
            size="small"
            sx={{ width: 40, height: 40 }}
            onClick={openSearch}
          >
            <Badge
              badgeContent={activeFiltersCount > 0 ? activeFiltersCount : null}
              color="secondary"
            >
              <SearchIcon
                fontSize="small"
                color={activeFiltersCount > 0 ? 'warning' : 'inherit'}
              />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={closeSearch}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          
          <AllFilters 
            columnsSchema={columnsSchema}
          />
        </Menu>
      </>
    );
  };

  const renderAdd = () => {
    if(!showAdd) return;
    return <Tooltip title="Dodaj">
      <IconButton size="small" sx={{ width: 40, height: 40 }} color='primary' onClick={() => onOpenSettings('addForm')}>
        <AddCircleOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  };

  const renderShowSelected = () => {
    if(actionsApi.selectedIds.length){
      if(!columnsSchema.showSelected){
        return <Tooltip title={"Filtruj zaznaczone (" + actionsApi.selectedIds.length + ")"}>
      <IconButton size="small" sx={{ width: 40, height: 40 }} color="secondary" onClick={() => columnsSchema.setShowSelected(true)}>
        <CheckCircleIcon  fontSize="small" />
      </IconButton>
    </Tooltip>
      }else{
        return <Tooltip title={"Usuń filtr zaznaczone (" + actionsApi.selectedIds.length + ")"}>
      <IconButton size="small" sx={{ width: 40, height: 40 }} color="secondary" onClick={() => columnsSchema.setShowSelected(false)}>
        <ClearIcon fontSize="small" />
      </IconButton>
    </Tooltip>
      }
    }
  }

  const renderBulkEditControl = () => {
    if(actionsApi.selectedIds.length && bulkEdit){
      return <Tooltip title="Multi Edycja">
        <IconButton size="small" sx={{ width: 40, height: 40 }} color="secondary" onClick={() => onOpenSettings('bulkForm')}>
          <ChecklistIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    }    
  }

  const renderBulkDeleteControl = () => {
    const handle = async () => {
      const res = await onBulkDelete(actionsApi.selectedIds);
      console.log(res);
      actionsApi.clearMultiSelect();
    }

    if(actionsApi.selectedIds.length){
      return <Tooltip title="Usuń zaznaczone">
        <IconButton size="small" sx={{ width: 40, height: 40 }} color="error" onClick={handle}>
          <DeleteForeverIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    }    
  }

  const renderPresetControl = () => {
    if(!showPresets) return;
    return <Tooltip title="Preset">
      <IconButton size="small" sx={{ width: 40, height: 40 }} color="primary" onClick={() => onOpenSettings('presets')}>
        <TuneIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  }

  const renderRefreshControl = () => (
    <Tooltip title="Odśwież dane">
      <IconButton size="small" sx={{ width: 40, height: 40 }} color="primary" onClick={onRefresh} disabled={loading}>
        <RefreshIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const renderExportControl = () => {
    if(!showExport) return;
    return <Tooltip title="Export Data">
      <IconButton size="small" sx={{ width: 40, height: 40 }} color='info' onClick={onExport}>
        <FileDownloadIcon fontSize="small" />
      </IconButton>
    </Tooltip> 
  }

  const renderUploadControl = () => {
    if(!showUpload) return;
    return <Tooltip title="Upload XSLSX">
      <IconButton size="small" sx={{ width: 40, height: 40 }} color='info' onClick={() => onOpenSettings('uploadData')}>
        <UploadFileIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  };

  return (
    <Box
      sx={{
        width: '48px',
        backgroundColor: '#f7f7f7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 1,
        borderLeft: '1px solid #ddd',
        gap: 1,
      }}
    >
      {renderSearchControl()}
      {renderAdd()}
      {renderShowSelected()}
      {renderRefreshControl()}
      {renderPresetControl()}
      {renderExportControl()}
      {renderBulkEditControl()}
      {renderBulkDeleteControl()}
      {renderUploadControl()}
    </Box>
  );
};

export default PowerSidebar;
