/*
- paginacja tylko na górze, wyłączyć wyświetlania paginacji na dole,
- tabela wraz zgórnym menu ma się wyświetlac tylko w zakresie zadanym przez CRUD, skrolować tylko zawartość tabeli tak jak to działa w fullscreen,
obecnie przy wiekszej ilosci wierzy scroluje sie całe okno wraz nagłówkami tabeli, mimo ustawienia sticky header nie są one przytwierdzone.
- nie pokazuje się globalna szukajka
- przy grupowaniu wierszy zliczać id jako distinct count, oraz aktywować rozwijanie wierszy, deaktywować gdy dane nie są grupowane i nie ma danych strukturalnych wiersza.
*/


import React from 'react';
import { Box } from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ToggleFullScreenButton,
  MRT_ToolbarAlertBanner,
  MRT_TablePagination,
} from 'material-react-table';

import Controls from './Controls';


const Mrt = ({ data, columns, config, openDrawer }) => {

  const table = useMaterialReactTable({
    data,
    columns,
    ...config,
    renderTopToolbar: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 1rem',
          gap: 1,
        }}
      >
        {/* LEFT side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MRT_TablePagination table={table} />
          <MRT_ToggleFullScreenButton table={table} />
          <MRT_ToolbarAlertBanner table={table} />
        </Box>
        {/* RIGHT side */}
        <Controls openDrawer={openDrawer} />
      </Box>
    ),
  });

  return (
    <MaterialReactTable
      table={table}
    />
  );
};

export default Mrt;
