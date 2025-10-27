import React from 'react';
import {
  Box,
  Slider,
  Modal
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FunctionsIcon from '@mui/icons-material/Functions';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import DataObjectIcon from '@mui/icons-material/DataObject';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';

//Comp
import ConfigMenuSection from './configMenuSection';
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

  const handleHeaderNameChange = val => {
    console.log(val);
  }

  return (
    <Modal open={Boolean(field)} onClose={close}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 380,
          maxHeight: '85vh',
          bgcolor: 'background.paper',
          boxShadow: 8,
          borderRadius: 2,
          overflowY: 'auto',
          p: 2,
          outline: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {/* --- Quick Actions (sort / align / group etc.) --- */}
        <ColumnQuickActions
          field={field}
          column={col}
          columnsSchema={columnsSchema}
          close={close}
        />

        {/* --- Width --- */}
        <Box sx={{ px: 1, py: 1 }}>
          <Slider
            value={col.width || 120}
            min={40}
            max={500}
            step={20}
            onChangeCommitted={(_, val) => columnsSchema.setColumnWidth(field, val)}
            valueLabelDisplay="auto"
          />
        </Box>

        {/* --- Header name --- */}
        <InputTextHint
          hints={[]}
          defaultValue={headerNameInitial || ''}
          onSubmit={(val) => columnsSchema.setHeaderName(field, val)}
          placeholder='Nagłówek...'
          sx={{ mb: 1 }}
          icon={<LabelOutlinedIcon />}
        />

        {/* --- Group --- */}
        <InputTextHint
          hints={columnsSchema.getAllGroups()}
          defaultValue={col.fieldGroup || ''}
          onSubmit={(val) => columnsSchema.setGroupName(field, val)}
          placeholder='Grupa pól...'
          sx={{ mb: 1 }}
          icon={<GroupWorkIcon />}
        />

        {/* --- Type --- */}
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

        {/* --- Formatters --- */}
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

        {/* --- Column Visibility --- */}
        <ConfigMenuSection
          icon={<ViewColumnIcon />}
          label="Kolumny"
        >
          <ColumnList columnsSchema={columnsSchema} />
        </ConfigMenuSection>

        {/* --- Filters --- */}
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

        {/* --- Aggregation --- */}
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
    </Modal>
  );
};

export default ColumnConfigurator;
