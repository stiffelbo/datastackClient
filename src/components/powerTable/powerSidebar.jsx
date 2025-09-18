// powerSidebar.jsx
import React from 'react';
import { Box, IconButton, Tooltip, Badge } from '@mui/material';

// Placeholder icons
import TuneIcon from '@mui/icons-material/Tune';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FilterListIcon from '@mui/icons-material/FilterList';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import SettingsIcon from '@mui/icons-material/Settings';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CodeIcon from '@mui/icons-material/Code';

const PowerSidebar = ({ onOpenSettings }) => {

  const renderCustomControl = () => {
    return <Tooltip title="Custom Field">
      <IconButton size="small" sx={{ width: 40, height: 40 }} onClick={()=> onOpenSettings('custom')}>
        <CodeIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  }

  const renderPresetControl = () => {
    return <Tooltip title="Preset">
      <IconButton size="small" sx={{ width: 40, height: 40 }} onClick={()=> onOpenSettings('presets')}>
        <TuneIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  }

  const renderRefreshControl = () => (
    <Tooltip title="Refresh Data">
      <IconButton size="small" sx={{ width: 40, height: 40 }}>
        <RefreshIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const renderDisplayModeControl = () => (
    <Tooltip title="Display Mode">
      <IconButton size="small" sx={{ width: 40, height: 40 }}>
        <ViewModuleIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const renderFilterModeControl = () => (
    <Tooltip title="Filter Mode">
      <IconButton size="small" sx={{ width: 40, height: 40 }}>
        <FilterListIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const renderClearFiltersControl = (activeCount = 0) => (
    <Tooltip title="Clear Filters">
      <IconButton size="small" sx={{ width: 40, height: 40 }}>
        <Badge badgeContent={activeCount} color="secondary">
          <LayersClearIcon fontSize="small" />
        </Badge>
      </IconButton>
    </Tooltip>
  );

  const renderSettingsControl = () => (
    <Tooltip title="Table Settings">
      <IconButton size="small" sx={{ width: 40, height: 40 }} onClick={()=> onOpenSettings('settings')}>
        <SettingsIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const renderExportControl = () => (
    <Tooltip title="Export Data">
      <IconButton size="small" sx={{ width: 40, height: 40 }}>
        <FileDownloadIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

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
      {renderCustomControl()}
      {renderRefreshControl()}
      {renderPresetControl()}
      {renderDisplayModeControl()}
      {renderFilterModeControl()}
      {renderClearFiltersControl(2)}
      {renderSettingsControl()}
      {renderExportControl()}
    </Box>
  );
};

export default PowerSidebar;
