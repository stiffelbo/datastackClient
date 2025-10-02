// powerSidebar.jsx
import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Badge, Menu } from '@mui/material';

// Icons
import TuneIcon from '@mui/icons-material/Tune';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';

import AllFilters from './filter/allFilters';

const PowerSidebar = ({ onOpenSettings, presets, columnsSchema, onExport, onRefresh, loading }) => {

  const [anchorEl, setAnchorEl] = useState(null);

  const openSearch = (e) => setAnchorEl(e.currentTarget);
  const closeSearch = () => setAnchorEl(null);

  

  //Filters
  const renderSearchControl = () => {
    const allFilters = columnsSchema.getAllFilters();
    const activeFiltersCount = allFilters.length + (columnsSchema.globalSearch ? 1 : 0);
    const {globalSearch, setGlobalSearch} = columnsSchema;

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

  const renderCustomControl = () => {
    return <Tooltip title="Custom Field">
      <IconButton size="small" sx={{ width: 40, height: 40 }} onClick={() => onOpenSettings('custom')}>
        <CodeIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  }

  const renderPresetControl = () => {
    return <Tooltip title="Preset">
      <IconButton size="small" sx={{ width: 40, height: 40 }} onClick={() => onOpenSettings('presets')}>
        <TuneIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  }

  const renderRefreshControl = () => (
    <Tooltip title="Refresh Data">
      <IconButton size="small" sx={{ width: 40, height: 40 }} onClick={onRefresh}>
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

  const renderSettingsControl = () => (
    <Tooltip title="Table Settings">
      <IconButton size="small" sx={{ width: 40, height: 40 }} onClick={() => onOpenSettings('settings')}>
        <SettingsIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  const renderExportControl = () => (
    <Tooltip title="Export Data">
      <IconButton size="small" sx={{ width: 40, height: 40 }} color='primary' onClick={onExport}>
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
      {renderSearchControl()}
      {renderCustomControl()}
      {renderRefreshControl()}
      {renderPresetControl()}
      {renderSettingsControl()}
      {renderExportControl()}
    </Box>
  );
};

export default PowerSidebar;
