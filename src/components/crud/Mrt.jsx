import React from 'react';
import { Box } from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ToggleFiltersButton,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
  MRT_ToolbarAlertBanner,
  MRT_TablePagination,
  MRT_GlobalFilterTextField,
} from 'material-react-table';


const Mrt = ({ data, columns, config, height = null, width = null }) => {
  const table = useMaterialReactTable({
    data,
    columns,
    ...config,
    paginationDisplayMode: 'custom', // 👈 wyłącza domyślną paginację
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
                <MRT_GlobalFilterTextField table={table} />
                <MRT_ToggleFiltersButton table={table} />
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleDensePaddingButton table={table} />
                <MRT_ToggleFullScreenButton table={table} />
            </Box>

            {/* RIGHT side */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MRT_TablePagination table={table} />
            </Box>
        </Box>
    ),
  });

  return (
    <Box
      sx={{
        height: height ?? '100%',
        maxHeight: height ?? '100%',
        width: width ?? '100%',
        maxWidth: width ?? '100%',
        overflow: 'hidden',
      }}
    >
      <MaterialReactTable
        table={table}
        muiTableContainerProps={{
          sx: {
            height: '100%',
            maxHeight: '100%',
            overflow: 'auto',
          },
        }}
      />
    </Box>
  );
};

export default Mrt;
