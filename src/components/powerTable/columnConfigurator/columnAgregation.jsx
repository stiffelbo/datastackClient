import React, { useMemo } from "react";
import {
  Box,
  Typography,
  MenuItem,
  ListItemText,
  Divider,
} from "@mui/material";

/**
 * ColumnAggregation – wybór funkcji agregującej dla kolumny
 */
const ColumnAggregation = ({ field, column, columnsSchema, onClose }) => {
  const current = column?.aggregationFn || null;

  const aggregations = useMemo(
    () => [
      { key: null, label: "Wyczyść agregację" },
      { key: "sum", label: "Suma" },
      { key: "avg", label: "Średnia" },
      { key: "median", label: "Mediana" },
      { key: "min", label: "Minimum" },
      { key: "max", label: "Maksimum" },
      { key: "count", label: "Liczba" },
      { key: "countDistinct", label: "Unikalne" },
      { key: "notEmpty", label: "Niepuste" },
      { key: "empty", label: "Puste" },
    ],
    []
  );

  const handleSelect = (fn) => {
    if (!fn) columnsSchema.removeAggregation(field);
    else columnsSchema.setAggregationFn(field, fn);
    onClose?.();
  };

  return (
    <Box sx={{ width: 260, p: 1 }}>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, opacity: 0.7, textAlign: "center" }}
      >
        Agregacja wartości
      </Typography>

      {aggregations.map((item) => (
        <MenuItem
          key={item.key || "none"}
          onClick={() => handleSelect(item.key)}
          selected={current === item.key}
          sx={{
            fontWeight: current === item.key ? 600 : 400,
            color: item.key === null ? "error.main" : "inherit",
          }}
        >
          <ListItemText primary={item.label} />
        </MenuItem>
      ))}

      <Divider sx={{ my: 1 }} />

      <Typography
        variant="caption"
        sx={{ opacity: 0.6, display: "block", textAlign: "center" }}
      >
        Aktualna: {current || "brak"}
      </Typography>
    </Box>
  );
};

export default ColumnAggregation;
