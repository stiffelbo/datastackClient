import React from "react";
import {
  Box,
  MenuItem,
  ListItemText,
} from "@mui/material";

const TYPES = [
  { key: "string", label: "Tekstowy 🅰️" },
  { key: "number", label: "Liczbowy 🔢" },
  { key: "date", label: "Data 📅" },
  { key: "boolean", label: "Logiczny ✔️" },
];

/**
 * ColumnType – wybór typu danych kolumny
 */
const ColumnType = ({ field, column, columnsSchema, onClose }) => {
  const current = column?.type || "string";

  const handleSelect = (type) => {
    columnsSchema.setType(field, type);
    onClose?.();
  };

  return (
    <Box sx={{ width: '100%', p: 1 }}>

      {TYPES.map((item) => (
        <MenuItem
          key={item.key}
          selected={current === item.key}
          onClick={() => handleSelect(item.key)}
        >
          <ListItemText primary={item.label} />
        </MenuItem>
      ))}


    </Box>
  );
};

export default ColumnType;
