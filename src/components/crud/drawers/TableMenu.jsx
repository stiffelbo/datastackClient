import React from 'react';
import {
  Box,
  Typography,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';

const MRT_OPTIONS = {
  tabela: {
    enableStickyHeader: 'Przypięty nagłówek',
    enableStickyFooter: 'Przypięta stopka',
    enableFullScreenToggle: 'Pełny ekran',
    enableColumnVirtualization: 'Wirtualizacja kolumn',
    enableRowVirtualization: 'Wirtualizacja wierszy',
    enableGlobalFilter: 'Filtr Globalny',
    enableGrouping: 'Grupowanie'
  },
  nagłówki: {
    enableSorting: 'Sortowanie',
    enableMultiSort: 'Sortowanie wielopolowe',
    enableColumnOrdering: 'Przestawianie kolumn',
    enableColumnFilter: 'Filtrowanie',
  },
  kolumny: {
    enableColumnPinning: 'Przypinanie kolumn',
    enableColumnResizing: 'Rozszerzanie kolumn',
    enableColumnDragging: 'Przeciąganie kolumn',
    enableColumnOrdering: 'Przeciąganie kolumn',
    enableColumnFilters: 'Filtrowanie Kolumn',
    enableColumnFilterModes: 'Filtrowanie Tryby',
  },
  wiersze: {
    enableRowSelection: 'Zaznaczanie wierszy',
    enableRowActions: 'Akcje wiersza',
    enableRowNumbers: 'Numeracja wierszy',
    enableExpanding: 'Rozwijanie wierszy',
  },
};

const TableMenu = ({ config, onChange }) => {
  if (!config || !onChange) {
    return <h1>Brak configu</h1>;
  }

  const handleToggle = (key) => (event) => {
    onChange({ ...config, [key]: event.target.checked });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Opcje tabeli
      </Typography>

      <Grid container spacing={2}>
        {Object.entries(MRT_OPTIONS).map(([groupKey, options]) => (
          <Grid item xs={12} sm={6} key={groupKey}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {groupKey.toUpperCase()}
              </Typography>
              <FormGroup>
                {Object.entries(options).map(([key, label]) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Checkbox
                        checked={!!config[key]}
                        onChange={handleToggle(key)}
                      />
                    }
                    label={label}
                  />
                ))}
              </FormGroup>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TableMenu;
