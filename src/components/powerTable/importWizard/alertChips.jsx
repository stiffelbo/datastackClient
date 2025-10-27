// AlertsChips.jsx
import React from "react";
import { Box, Tooltip, Chip, Typography } from "@mui/material";
import TableRowsIcon from "@mui/icons-material/TableRows";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

/**
 * AlertsChips
 *
 * Props:
 *  - alertsProps: optional object { totalRows, mappedCount, requiredMissingList, totalFields }
 *  - rowsCount: number (fallback if alertsProps.totalRows not provided)
 *  - importSchema: optional array — jeśli podane, totalFields będzie liczba pól nie-computed w schema
 *  - mapping: optional object { field: header } — jeśli podane, mappedFields będzie policzone z mappingu
 */
const AlertsChips = ({ alertsProps = null, rowsCount = 0, importSchema = null, mapping = null }) => {
  // rows
  const totalRows = Number(alertsProps?.totalRows ?? rowsCount ?? 0);

  // required missing (if provided)
  const requiredMissingList = Array.isArray(alertsProps?.requiredMissingList) ? alertsProps.requiredMissingList : [];

  // compute totalFields: prefer importSchema, otherwise alertsProps.totalFields if present, otherwise 0
  let totalFields = 0;
  if (Array.isArray(importSchema)) {
    totalFields = importSchema.filter((f) => !f.computed).length;
  } else if (typeof alertsProps?.totalFields === "number") {
    totalFields = alertsProps.totalFields;
  }

  // compute mappedFields: prefer mapping if provided, otherwise alertsProps.mappedCount
  let mappedFields = 0;
  if (mapping && typeof mapping === "object") {
    // only consider keys that exist in importSchema (if provided) or all keys in mapping
    const fieldsToConsider = Array.isArray(importSchema)
      ? importSchema.filter((f) => !f.computed).map((f) => f.field)
      : Object.keys(mapping);

    mappedFields = fieldsToConsider.reduce((acc, fld) => {
      const v = mapping[fld];
      // treat anything non-empty string as mapped, including "__none__"
      if (typeof v === "string" && v !== "") return acc + 1;
      return acc;
    }, 0);
  } else if (typeof alertsProps?.mappedCount === "number") {
    mappedFields = alertsProps.mappedCount;
  }

  // percent and status
  const percent = totalFields > 0 ? mappedFields / totalFields : 0;

  // status color rules:
  // - success: 100% mapped
  // - error: < 50% (mapped < half)
  // - warning: >=50% and <100%
  let fieldsColor = "default";
  let fieldsVariant = "outlined";
  if (totalFields === 0) {
    fieldsColor = "default";
    fieldsVariant = "outlined";
  } else if (percent === 1) {
    fieldsColor = "success";
    fieldsVariant = "filled";
  } else if (percent < 0.5) {
    fieldsColor = "error";
    fieldsVariant = "outlined";
  } else {
    fieldsColor = "warning";
    fieldsVariant = "outlined";
  }

  // tooltips
  const rowsTip = totalRows === 0 ? "Brak załadowanego pliku. Wybierz plik aby zobaczyć dane." : `Plik zawiera ${totalRows} wierszy.`;
  const fieldsTip = totalFields === 0
    ? "Brak pól do mapowania (schema pusta lub wszystkie pola są computed)."
    : `Zmapowano ${mappedFields}/${totalFields} pól (${Math.round(percent * 100)}%).`;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
      <Tooltip title={rowsTip}>
        <Chip
          size="small"
          icon={<TableRowsIcon fontSize="small" />}
          label={`W: ${totalRows}`}
          color={totalRows > 0 ? "primary" : "default"}
          variant="outlined"
        />
      </Tooltip>

      <Tooltip title={fieldsTip}>
        <Chip
          size="small"
          icon={<CheckCircleIcon fontSize="small" />}
          label={`Pola: ${mappedFields}/${totalFields}`}
          color={fieldsColor}
          variant={fieldsVariant}
        />
      </Tooltip>
    </Box>
  );
};

export default AlertsChips;
