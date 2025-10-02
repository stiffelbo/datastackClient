import React, {useState} from "react";
import {
  Box,
  Divider,
  IconButton,
  Tooltip,
  Button,
  TextField,
  InputAdornment
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LayersClearIcon from "@mui/icons-material/LayersClear";
import ClearIcon from "@mui/icons-material/Clear";
import SaveIcon from "@mui/icons-material/Save";

const formatFilterValue = (filter) => {
  if (filter.value === null || filter.value === undefined || filter.value === '') return '(pusty)';
  if (typeof filter.value === 'object') {
    if (filter.op === 'between') {
      return `${filter.value.min || ''} – ${filter.value.max || ''}`;
    }
    if (filter.op === 'multiSelect') {
      const { include = [], exclude = [] } = filter.value;
      return `+${include.join(', ')}  -${exclude.join(', ')}`;
    }
    return JSON.stringify(filter.value);
  }
  return String(filter.value);
};

const AllFilters = ({ columnsSchema }) => {

   const [value, setValue] = useState(columnsSchema.globalSearch || "");

  const handleCommit = () => {
    columnsSchema.setGlobalSearch(value.trim());
  };

  const handleClear = () => {
    setValue("");
    columnsSchema.setGlobalSearch("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCommit();
    }
    if (e.key === "Escape") {
      setValue(columnsSchema.globalSearch || "");
    }
  };

  const allFilters = columnsSchema.getAllFilters();

  return (
    <Box sx={{ width: 480, p: 1 }}>

      {/* global search */}
      <TextField
        size="small"
        fullWidth
        placeholder="Global search..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {value && (
                <Tooltip title="Wyczyść">
                  <IconButton size="small" color="error" onClick={handleClear}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Zapisz">
                <IconButton size="small" color="primary" onClick={handleCommit}>
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />
      <Divider />
      {/* column filters */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {allFilters.map(({ headerName, filter }) => (
          <Box
            key={filter.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.8em",
              px: 1,
              py: 0.5,
              border: "1px solid #eee",
              borderRadius: 1,
              backgroundColor: "#fafafa",
            }}
          >
            <span>
              <strong>{headerName}</strong> {filter.op} → {formatFilterValue(filter)}
            </span>
            <Tooltip title="Usuń filtr">
              <IconButton
                size="small"
                color="error"
                onClick={() => columnsSchema.removeFilter(filter.field, filter.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Box>

      {/* clear all */}
      <Box sx={{ textAlign: "right", mt: 1 }}>
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<LayersClearIcon />}
          onClick={() => {
            setValue('');
            columnsSchema.clearAllFilters();
            columnsSchema.setGlobalSearch('');
          }}
        >
          Wyczyść wszystko
        </Button>
      </Box>
    </Box>
  );
};

export default AllFilters;
