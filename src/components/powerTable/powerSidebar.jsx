// powerSidebar.jsx
import React from 'react';
import { Box, IconButton, Tooltip, Badge } from '@mui/material';

// Placeholder icons
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FilterListIcon from '@mui/icons-material/FilterList';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import SettingsIcon from '@mui/icons-material/Settings';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const PowerSidebar = ({ config = [], onOpenSettings, columnsSchema }) => {

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
      <IconButton size="small" sx={{ width: 40, height: 40 }} onClick={onOpenSettings}>
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
      {renderRefreshControl()}
      {renderDisplayModeControl()}
      {renderFilterModeControl()}
      {renderClearFiltersControl(2)}
      {renderSettingsControl()}
      {renderExportControl()}
    </Box>
  );
};

export default PowerSidebar;
