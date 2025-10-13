import React, { useMemo } from "react";
import {
  Box,
  Typography,
  MenuItem,
  ListItemText,
  Divider,
} from "@mui/material";

// utils
import { valueFormatters } from "../valueFormatters";

/**
 * ColumnFormaters – wybór i czyszczenie formatera dla kolumny
 */
const ColumnFormaters = ({ field, column, columnsSchema, onClose }) => {
  const currentFormatter = column?.formatterKey || null;

  const formatterKeys = useMemo(() => Object.keys(valueFormatters), []);

  const handleSelect = (key) => {
    columnsSchema.setFormatterKey(field, key);
    onClose?.();
  };

  const handleClear = () => {
    columnsSchema.setFormatterKey(field, null);
    onClose?.();
  };

  return (
    <Box sx={{ width: 260, p: 1 }}>
      <MenuItem
        onClick={handleClear}
        selected={currentFormatter === null}
        sx={{
          color: "error.main",
          fontWeight: currentFormatter === null ? 600 : 400,
        }}
      >
        <ListItemText primary="Wyczyść formatowanie" />
      </MenuItem>

      <Divider sx={{ my: 1 }} />

      {formatterKeys.map((key) => (
        <MenuItem
          key={key}
          onClick={() => handleSelect(key)}
          selected={currentFormatter === key}
          sx={{
            fontWeight: currentFormatter === key ? 600 : 400,
          }}
        >
          <ListItemText primary={key} />
        </MenuItem>
      ))}

      <Divider sx={{ my: 1 }} />

      <Typography
        variant="caption"
        sx={{ opacity: 0.6, display: "block", textAlign: "center" }}
      >
        Dostępne formatery: {formatterKeys.length}
      </Typography>
    </Box>
  );
};

export default ColumnFormaters;
