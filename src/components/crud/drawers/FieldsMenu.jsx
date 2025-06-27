import React from 'react';
import {
  Box,
  Typography,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const AGGREGATION_FUNCTIONS = ['sum', 'count', 'average', 'min', 'max', 'uniqueCount'];

//brakuje nam wstawiania do columny agregateCell

const FieldsMenu = ({ columns = [], onColumnsChange }) => {

  console.log(columns, onColumnsChange);

  const handleFieldChange = (accessorKey, field, value) => {
    const updated = columns.map((col) =>
      col.accessorKey === accessorKey ? { ...col, [field]: value } : col
    );
    onColumnsChange(updated);
  };

  const handleToggleVisibility = (accessorKey) => (e) => {
    handleFieldChange(accessorKey, 'visible', e.target.checked);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Konfiguracja kolumn
      </Typography>

      <Grid container spacing={2}>
        {columns.map((col) => (
          <Grid item xs={12} sm={6} key={col.accessorKey}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {col.accessorKey}
              </Typography>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={col.visible !== false}
                      onChange={handleToggleVisibility(col.accessorKey)}
                    />
                  }
                  label="Widoczna"
                />

                <TextField
                  label="Nagłówek"
                  value={col.header || ''}
                  onChange={(e) =>
                    handleFieldChange(col.accessorKey, 'header', e.target.value)
                  }
                  fullWidth
                  size="small"
                  margin="dense"
                />

                <TextField
                  label="Szerokość"
                  type="number"
                  value={col.size || ''}
                  onChange={(e) =>
                    handleFieldChange(col.accessorKey, 'size', parseInt(e.target.value))
                  }
                  fullWidth
                  size="small"
                  margin="dense"
                />

                <FormControl fullWidth size="small" margin="dense">
                  <InputLabel>Agregacja</InputLabel>
                  <Select
                    value={col.aggregationFn || ''}
                    onChange={(e) =>
                      handleFieldChange(col.accessorKey, 'aggregationFn', e.target.value)
                    }
                    label="Agregacja"
                  >
                    {AGGREGATION_FUNCTIONS.map((fn) => (
                      <MenuItem key={fn} value={fn}>
                        {fn}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FormGroup>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FieldsMenu;
