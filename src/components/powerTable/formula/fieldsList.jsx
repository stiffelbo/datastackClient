import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Tooltip,
  IconButton,
  Typography,
  Stack,
  Divider,
} from '@mui/material';
import AbcIcon from '@mui/icons-material/Abc';
import NumbersIcon from '@mui/icons-material/Numbers';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Optional: your external filter component drives `filtered` via onFilter
import FilterTemplate from '../../filter/filterTemplate';

const TypeIcon = ({ type = 'string', sx = {} }) => {
  switch (type) {
    case 'number':
      return <NumbersIcon fontSize="small" sx={sx} />;
    case 'date':
      return <CalendarTodayIcon fontSize="small" sx={sx} />;
    case 'boolean':
      return <CheckCircleOutlineIcon fontSize="small" sx={sx} />;
    default:
      return <AbcIcon fontSize="small" sx={sx} />;
  }
};

const filterSchema = [
  {
    name: 'slug',
    label: 'Fraza',
    type: 'slug',
    itemFields: [],
    conditions: [],
    default: '',
    show: true,
    width: '160px',
  },
  {
    name: 'type',
    label: 'Typ pola',
    type: 'select-transistor',
    itemFields: ['type'],
    conditions: [],
    default: '',
    show: true,
    width: '150px',
  },
];

const FieldsList = ({ data = [], onClick }) => {
  const [filtered, setFiltered] = useState(data);
  const [filters, setFilters] = useState({});

  const renderItem = (c) => {
    return (
      <ListItem
        key={c.field}
        disableGutters
        onClick={()=>onClick(c.field)}
        dense
        sx={{ borderRadius: 1, '&:hover': { bgcolor: 'lightGray' }, cursor: 'pointer' }}
      >
          <ListItemIcon>
            <TypeIcon type={c.type} />
          </ListItemIcon>
          <ListItemText
            primary={
              c.headerName
            }
          />
      </ListItem>
    );
  };

  return (
    <Paper variant="outlined" sx={{ p: 1, height: '100%'}} tabIndex={0}>

      <FilterTemplate
        data={data}
        schema={filterSchema}
        onFilter={setFiltered}
        filters={filters}
        onChange={setFilters}
        disableConfigurator={true}
      />

      <Divider sx={{ my: 1 }} />

      <Box>
        <List dense disablePadding>
          {filtered.map((c, i) => renderItem(c, i))}
          {!filtered.length && (
            <Box sx={{ p: 2, textAlign: 'center', opacity: 0.6 }}>
              <Typography variant="body2">Brak wyników. Zmień filtr lub usuń kryteria.</Typography>
            </Box>
          )}
        </List>
      </Box>
    </Paper>
  );
};

export default FieldsList;
