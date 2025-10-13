import React from "react";
import { Stack, IconButton, Tooltip } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AlignHorizontalLeftIcon from "@mui/icons-material/AlignHorizontalLeft";
import AlignHorizontalCenterIcon from "@mui/icons-material/AlignHorizontalCenter";
import AlignHorizontalRightIcon from "@mui/icons-material/AlignHorizontalRight";
import Clear from "@mui/icons-material/Clear";

/**
 * ColumnQuickActions – pasek szybkich akcji dla kolumny
 * sortowanie / widoczność / grupowanie / wyrównanie
 */
const ColumnQuickActions = ({ field, column, columnsSchema, close }) => {
  const sortDir = columnsSchema.getSortDirection(field);
  const isGrouped = !!column.groupBy;
  const isHidden = !!column.hidden;
  const align = column.align || "left";

  // 🔁 cykl sortowania: asc → desc → none
  const handleSortToggle = () => {
    if (sortDir === "asc") columnsSchema.toggleSort(field, "desc");
    else if (sortDir === "desc") columnsSchema.removeSort(field);
    else columnsSchema.toggleSort(field, "asc");
  };

  // 👁 toggle widoczności
  const handleVisibilityToggle = () => {
    columnsSchema.toggleColumnHidden(field);
    close?.(); // zamknij modal po zmianie widoczności
  };

  // 🌳 toggle grupowania
  const handleGroupToggle = () => {
    columnsSchema.toggleGroupBy(field);
  };

  // ↔️ cykl align: left → center → right → left
  const handleAlignToggle = () => {
    const order = ["left", "center", "right"];
    const nextAlign = order[(order.indexOf(align) + 1) % order.length];
    columnsSchema.updateField(field, { align: nextAlign });
  };

  // 🧠 ikony align
  const AlignIcon =
    align === "left"
      ? AlignHorizontalLeftIcon
      : align === "center"
        ? AlignHorizontalCenterIcon
        : AlignHorizontalRightIcon;

  return (
    <Stack
      direction="row"
      spacing={1}
      justifyContent="space-between"
      sx={{
        my: 1,
        py: 0.5,
        borderRadius: 1,
      }}
    >
      {/* SORT */}
      <Tooltip title={`Sortowanie (${sortDir || "brak"})`}>
        <IconButton
          size="small"
          color={
            sortDir === "asc"
              ? "primary"
              : sortDir === "desc"
                ? "secondary"
                : "default"
          }
          onClick={handleSortToggle}
        >
          {sortDir === "asc" ? (
            <ArrowUpwardIcon fontSize="small" />
          ) : sortDir === "desc" ? (
            <ArrowDownwardIcon fontSize="small" />
          ) : (
            <ArrowUpwardIcon fontSize="small" sx={{ opacity: 0.4 }} />
          )}
        </IconButton>
      </Tooltip>

      {/* VISIBILITY */}
      <Tooltip title={isHidden ? "Pokaż kolumnę" : "Ukryj kolumnę"}>
        <IconButton
          size="small"
          color={isHidden ? "warning" : "default"}
          onClick={handleVisibilityToggle}
        >
          {isHidden ? (
            <VisibilityOffIcon fontSize="small" />
          ) : (
            <VisibilityIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>

      {/* GROUPING */}
      <Tooltip title={isGrouped ? "Usuń z grupowania" : "Grupuj po kolumnie"}>
        <IconButton
          size="small"
          color={isGrouped ? "success" : "default"}
          onClick={handleGroupToggle}
        >
          <AccountTreeIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* ALIGN */}
      <Tooltip title={`Wyrównanie: ${align}`}>
        <IconButton size="small" color="default" onClick={handleAlignToggle}>
          <AlignIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Zamknij */}
      <Tooltip title={`Zamknij Konfigurator`}>
        <IconButton
          size="small"
          color="error"
          onClick={() => close && close()}
        >
          <Clear />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default ColumnQuickActions;
