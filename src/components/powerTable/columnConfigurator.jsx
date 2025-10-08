// ColumnConfigurator.jsx
import React, { useState } from 'react';
import {
  Box,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Divider,
  Slider,
  Typography,
  Menu,
  IconButton
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FunctionsIcon from '@mui/icons-material/Functions';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReorderIcon from '@mui/icons-material/Reorder';
import DataObjectIcon from '@mui/icons-material/DataObject';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

//Comp
import FieldForm from './fieldForm';
import ColumnFilters from './filter/columnFilters';

//utils
import { valueFormatters } from './valueFormatters';

const ColumnConfigurator = ({ data = [], field, columnsSchema, close }) => {
  const col = columnsSchema.columns.find(c => c.field === field);
  if (!col) return null;
  const headerNameInitial = col.headerName;

  const [typeAnchorEl, setTypeAnchorEl] = useState(null);
  const [aggregationAnchorEl, setAggregationAnchorEl] = useState(null);
  const [visibilityAnchorEl, setVisibilityAnchorEl] = useState(null);
  const [formatterAnchorEl, setFormatterAnchorEl] = useState(null);

  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  const [dragIndex, setDragIndex] = useState(null);

  const handleSort = (direction) => {
    columnsSchema.setSortModel([{ field, direction }]);
  };

  const clearSort = () => {
    columnsSchema.setSortModel([]);
  };

  const toggle = (fn) => {
    fn(field);
  };

  const openTypeMenu = (e) => setTypeAnchorEl(e.currentTarget);
  const closeTypeMenu = () => setTypeAnchorEl(null);

  const openAggregationMenu = (e) => setAggregationAnchorEl(e.currentTarget);
  const closeAggregationMenu = () => setAggregationAnchorEl(null);

  const openVisibilityMenu = (e) => setVisibilityAnchorEl(e.currentTarget);
  const closeVisibilityMenu = () => setVisibilityAnchorEl(null);

  const openFormatterMenu = (e) => setFormatterAnchorEl(e.currentTarget);
  const closeFormatterMenu = () => setFormatterAnchorEl(null);

  const openFilterMenu = (e) => setFilterAnchorEl(e.currentTarget);
  const closeFilterMenu = () => setFilterAnchorEl(null);

  const setAggregation = (fnName) => {
    columnsSchema.setAggregationFn(field, fnName);
    closeAggregationMenu();
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (dragIndex !== null && dragIndex !== dropIndex) {
      columnsSchema.reorderColumn(dragIndex, dropIndex);
    }
    setDragIndex(null);
  };

  const formattersList = Object.keys(valueFormatters);


  return (
    <Box sx={{ width: 250, px: 1 }}>
      <FieldForm
        type="text"
        value={headerNameInitial}
        onCommit={val => columnsSchema.setHeaderName(field, val)}
        textFieldProps={{ variant: "standard" }}
      />
      {/* Side menu dla typu danych */}
      <MenuItem onClick={openTypeMenu}>
        <ListItemIcon><DataObjectIcon fontSize="small" /></ListItemIcon>
        <ListItemText primary="Typ Danych" />
        <ExpandMoreIcon fontSize="small" />
      </MenuItem>
      <Menu
        anchorEl={typeAnchorEl}
        open={Boolean(typeAnchorEl)}
        onClose={closeTypeMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {['string', 'number', 'date', 'boolean'].map(type => (
          <MenuItem
            key={type}
            onClick={() => { columnsSchema.setType(field, type); closeTypeMenu(); }}
            selected={col.type === type}
          >
            <ListItemText primary={type} />
          </MenuItem>
        ))}
      </Menu>

      <MenuItem onClick={() => handleSort('asc')}>
        <ListItemIcon><ArrowUpwardIcon fontSize="small" /></ListItemIcon>
        <ListItemText primary="Sortuj rosnąco" />
      </MenuItem>
      <MenuItem onClick={() => handleSort('desc')}>
        <ListItemIcon><ArrowDownwardIcon fontSize="small" /></ListItemIcon>
        <ListItemText primary="Sortuj malejąco" />
      </MenuItem>
      <MenuItem onClick={clearSort} disabled={!columnsSchema.sortModel?.length}>
        <ListItemIcon><ClearIcon fontSize="small" /></ListItemIcon>
        <ListItemText primary="Wyczyść sortowanie" />
      </MenuItem>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="body2">Szerokość kolumny</Typography>
        <Slider
          value={col.width || 120}
          min={40}
          max={300}
          step={10}
          onChangeCommitted={(_, val) => columnsSchema.setColumnWidth(field, val)}
          valueLabelDisplay="auto"
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      <MenuItem onClick={() => toggle(columnsSchema.toggleGroupBy)}>
        <ListItemIcon><GroupWorkIcon fontSize="small" /></ListItemIcon>
        <ListItemText primary={col.groupBy ? 'Wyłącz grupowanie' : 'Grupuj po kolumnie'} />
        <Checkbox edge="end" checked={!!col.groupBy} tabIndex={-1} disableRipple />
      </MenuItem>

      <MenuItem onClick={openAggregationMenu}>
        <ListItemIcon>
          <FunctionsIcon fontSize="small" color={columnsSchema.hasAggregation(field) ? "warning" : "inherit"} />
        </ListItemIcon>
        <ListItemText primary="Agregacja" />
        <ExpandMoreIcon fontSize="small" />
      </MenuItem>

      <MenuItem onClick={openFormatterMenu}>
        <ListItemIcon>
          <FormatSizeIcon fontSize="small" color={columnsSchema.hasFormatter(field) ? "warning" : "inherit"} />
        </ListItemIcon>
        <ListItemText primary="Formatowanie" />
        <ExpandMoreIcon fontSize="small" />
      </MenuItem>

      <MenuItem onClick={openVisibilityMenu}>
        <ListItemIcon><ViewColumnIcon fontSize="small" /></ListItemIcon>
        <ListItemText primary="Pokaż / ukryj kolumny" />
        <ExpandMoreIcon fontSize="small" />
      </MenuItem>

      <MenuItem onClick={openFilterMenu}>
        <ListItemIcon>
          <FilterAltIcon fontSize="small" color={columnsSchema.hasFilters(field) ? "warning" : "inherit"} />
        </ListItemIcon>
        <ListItemText primary="Filtry" />
        <ExpandMoreIcon fontSize="small" />
      </MenuItem>

      <Menu
        anchorEl={aggregationAnchorEl}
        open={Boolean(aggregationAnchorEl)}
        onClose={closeAggregationMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={() => { columnsSchema.removeAggregation(field); closeAggregationMenu(); }}>
          <ListItemText primary="Wyczyść agregację" />
        </MenuItem>
        {['sum', 'avg', 'median', 'min', 'max', 'count', 'countDistinct', 'notEmpty', 'empty'].map(fn => (
          <MenuItem
            key={fn}
            onClick={() => setAggregation(fn)}
            selected={columnsSchema.columns.find(c => c.field === field).aggregationFn === fn}
          >
            <ListItemText primary={fn} />
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={visibilityAnchorEl}
        open={Boolean(visibilityAnchorEl)}
        onClose={closeVisibilityMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {columnsSchema.columns.map((c, i) => (
          <MenuItem
            key={c.field}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(i)}
          >
            <Checkbox
              checked={!c.hidden}
              onClick={() => {
                columnsSchema.toggleColumnHidden(c.field);
              }}
            />
            <ListItemText primary={c.headerName || c.field} />
            <IconButton size="small" edge="end" sx={{ ml: 'auto', cursor: 'grab' }}>
              <ReorderIcon fontSize="small" />
            </IconButton>
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={formatterAnchorEl}
        open={Boolean(formatterAnchorEl)}
        onClose={closeFormatterMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={() => { columnsSchema.setFormatterKey(field, null); closeFormatterMenu(); }}>
          <ListItemText primary="Wyczyść formatowanie" />
        </MenuItem>
        {formattersList.map(fn => (
          <MenuItem
            key={fn}
            onClick={() => columnsSchema.setFormatterKey(field, fn)}
            selected={columnsSchema.columns.find(c => c.field === field).formatterKey === fn}
          >
            <ListItemText primary={fn} />
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={closeFilterMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <ColumnFilters
          data={data}
          field={field}
          column={col}
          columnsSchema={columnsSchema}
          onClose={closeFilterMenu}
        />
      </Menu>
    </Box>
  );
};

export default ColumnConfigurator;
