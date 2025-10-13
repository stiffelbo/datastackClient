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
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CategoryIcon from '@mui/icons-material/Category';

//Comp
import ConfigMenuSection from './configMenuSection';
import FieldForm from '../fieldForm';
import InputTextHint from '../inputs/inputTextHint';

import ColumnQuickActions from './columnQuickActions';
import ColumnFormaters from './columnFormaters';
import ColumnFilters from '../filter/columnFilters';
import ColumnList from './columnList';
import ColumnAggregation from "./columnAgregation";
import ColumnType from './columnsType';

const ColumnConfigurator = ({ data = [], field, columnsSchema, close }) => {
  const col = columnsSchema.columns.find(c => c.field === field);
  if (!col) return null;
  const headerNameInitial = col.headerName;

  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 500,
        width: 350,
        height: 'min(auto, 80vh)',
        bgcolor: "background.paper",
        boxShadow: 8,
        borderRadius: 2,
        overflowY: "auto",
        padding: '1em'
      }}
    >
      <ColumnQuickActions
        field={field}
        column={col}
        columnsSchema={columnsSchema}
        close={close}
      />

      <Box sx={{ px: 2, py: 1 }}>
        <Slider
          value={col.width || 120}
          min={40}
          max={500}
          step={20}
          onChangeCommitted={(_, val) => columnsSchema.setColumnWidth(field, val)}
          valueLabelDisplay="auto"
        />
      </Box>

      <InputTextHint
        hints={[]}
        defaultValue={headerNameInitial || ''}
        onCommit={val => columnsSchema.setHeaderName(field, val)}
        placeholder='Nagłówek...'
        sx={{marginBottom: '1em'}}
      />

      <InputTextHint
        hints={columnsSchema.getAllGroups()}
        defaultValue={col.fieldGroup || ''}
        onSubmit={(val) => columnsSchema.setGroupName(field, val)}
        placeholder='Grupa pól..'
        sx={{marginBottom: '1em'}}
      />
      {/* Side menu dla typu danych */}
      <ConfigMenuSection
        icon={<DataObjectIcon />}
        label="Typ danych"
        active={!!col.type}
      >
        <ColumnType
          field={field}
          column={col}
          columnsSchema={columnsSchema}
        />
      </ConfigMenuSection>

      <ConfigMenuSection
        icon={<FormatSizeIcon />}
        label="Formatowanie"
        active={columnsSchema.hasFormatter(field)}
      >
        <ColumnFormaters
          data={data}
          field={field}
          column={col}
          columnsSchema={columnsSchema}
        />
      </ConfigMenuSection>

      <ConfigMenuSection
        icon={<ViewColumnIcon />}
        label="Kolumny"
      >
        <ColumnList columnsSchema={columnsSchema} />
      </ConfigMenuSection>


      <ConfigMenuSection
        icon={<FilterAltIcon />}
        label="Filtry"
        active={columnsSchema.hasFilters(field)}
      >
        <ColumnFilters
          data={data}
          field={field}
          column={col}
          columnsSchema={columnsSchema}
        />
      </ConfigMenuSection>

      <ConfigMenuSection
        icon={<FunctionsIcon />}
        label="Agregacja"
        active={columnsSchema.hasAggregation(field)}
      >
        <ColumnAggregation
          field={field}
          column={col}
          columnsSchema={columnsSchema}
        />
      </ConfigMenuSection>

    </Box>
  );
};

export default ColumnConfigurator;
