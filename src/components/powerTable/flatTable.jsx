import React, { useState, useCallback } from 'react';
import { TableContainer, Table, Paper, Box } from '@mui/material';
import PowerTableHead from './powerTableHead';
import PowerTableBody from './powerTableBody';
import PowerTableFooter from './powerTableFooter';

const FlatTable = ({
  initialData,
  data,
  columnsSchema,
  rowRules,
  settings,
  footerConfig,
  isVirtualized = false,
  height = 600,
  editing,
  actionsApi
}) => {
  const [heightMap, setHeightMap] = useState({ header: 0, footer: 0 });
  const [scrollTop, setScrollTop] = useState(0);

  const handleHeightChange = useCallback((section, value) => {
    setHeightMap(prev => ({ ...prev, [section]: value }));
  }, []);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const bodyHeight = height - (heightMap.header + heightMap.footer);

  return (
    <Box sx={{ height: '100%' }}>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: '100%',
          width: '100%',
          maxWidth: '100%',
          overflowY: 'auto'
        }}
        onScroll={handleScroll}
      >
        <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <PowerTableHead
            columnsSchema={columnsSchema}
            settings={settings}
            initialData={initialData}
            onHeightChange={(val) => handleHeightChange('header', val)}
            height={heightMap.header}
            actionsApi={actionsApi}
          />
          <PowerTableBody
            data={data}
            columnsSchema={columnsSchema}
            rowRules={rowRules}
            settings={settings}
            isVirtualized={isVirtualized}
            height={bodyHeight}
            scrollTop={scrollTop}
            editing={editing}
            actionsApi={actionsApi}
          />
          <PowerTableFooter
            data={data}
            columnsSchema={columnsSchema}
            settings={settings}
            onHeightChange={(val) => handleHeightChange('footer', val)}
            height={heightMap.header}
            actionsApi={actionsApi}
          />
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FlatTable;
