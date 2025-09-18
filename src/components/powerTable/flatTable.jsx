import React from 'react';
import {
  TableContainer, Table, Paper, Box
} from '@mui/material';

import PowerTableHead from './powerTableHead';
import PowerTableBody from './powerTableBody';
import PowerTableFooter from './powerTableFooter';
import PowerTableControl from './powerTableControl';

const FlatTable = ({
  data,
  columnsSchema,
  rowRules,
  settings,
  footerConfig
}) => {

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PowerTableControl columnsSchema={columnsSchema} />

      <TableContainer component={Paper} sx={{ maxHeight: '100%', width: '100%', maxWidth: '100%' }}>
        <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
          <PowerTableHead columnsSchema={columnsSchema} settings={settings} />
          <PowerTableBody data={data} columnsSchema={columnsSchema} rowRules={rowRules} settings={settings} />
          <PowerTableFooter data={data} columnsSchema={columnsSchema} config={footerConfig} settings={settings} />
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FlatTable;
