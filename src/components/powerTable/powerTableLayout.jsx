import React from 'react';
import { Box, TableContainer, Table, Paper } from '@mui/material';
import PowerTableHead from './powerTableHead';
import PowerTableBody from './powerTableBody';
import PowerTableFooter from './powerTableFooter';
import PowerSidebar from './powerSidebar';

const PowerTableLayout = ({ data, columns, rowRules, sidebarConfig, footerConfig, onOpenSettings, settings }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        bgcolor:
          settings.background === 'light'
            ? '#f9f9f9'
            : settings.background === 'dark'
            ? '#1e1e1e'
            : 'transparent'
      }}
    >
       {/* Sidebar */}
       <PowerSidebar config={sidebarConfig} onOpenSettings={onOpenSettings} />
      {/* Table Section */}
      <Box sx={{ flex: '1 1 auto', overflow: 'auto' }}>
        <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
          <Table stickyHeader size="small">
            <PowerTableHead columns={columns} settings={settings} />
            <PowerTableBody data={data} columns={columns} rowRules={rowRules} settings={settings} />
            <PowerTableFooter data={data} columns={columns} config={footerConfig} settings={settings} />
          </Table>
        </TableContainer>
      </Box>

     
    </Box>
  );
};

export default PowerTableLayout;
