import React from "react";
import { TableCell, Typography, Box } from "@mui/material";
import { valueFormatters } from "../valueFormatters";
import {
  getCellSx,
  getCellInnerSx,
} from "./cellLayout";

const normalize = (x) => {
  if (x === null || x === undefined || x === "") return null;
  if (typeof x === "boolean") return x;
  if (typeof x === "number") return x !== 0;

  if (typeof x === "string") {
    const s = x.trim().toLowerCase();

    if (
      s === "1" ||
      s === "true" ||
      s === "yes" ||
      s === "y"
    ) {
      return true;
    }

    if (
      s === "0" ||
      s === "false" ||
      s === "no" ||
      s === "n"
    ) {
      return false;
    }
  }

  return null;
};


const renderBool = (v, fontSize) => {
  const nv = normalize(v);

  if (nv === null) return "";

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        minWidth: 0,
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Typography
        component="span"
        sx={{
          color: nv ? "success.main" : "error.main",
          fontSize,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {nv ? "✓" : "✕"}
      </Typography>

      <Typography
        component="span"
        sx={{
          color: "text.secondary",
          fontSize,
          lineHeight: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {nv ? "Tak" : "Nie"}
      </Typography>
    </Box>
  );
};

const DisplayCell = ({
  value,
  column = {},
  settings = {},
  parent,
  params = {},
  onDoubleClick,
  editing,
}) => {
  const {
    sx = {},
    fontSize = "0.7rem",
    rowHeight: configuredRowHeight,
    px = "6px",
    py = "6px",
    ellipsis = false,
    align = column.align || "left",
  } = settings;

  const isVirtual =
    !!settings.isVirtualized &&
    Number(configuredRowHeight) > 0;

  const virtualFlex =
    !!settings.virtualFlex;

  const fixedRowHeight = isVirtual
    ? Number(configuredRowHeight)
    : undefined;

  const baseCellSx = getCellSx({
    column,
    settings,
    sx: settings.sx,
    align,
  });

  const baseInnerSx = {
    ...getCellInnerSx({
      settings,
      mode: "display",
    }),

    fontSize,
    textAlign: align,
  };

  const formatter =
    column.formatterKey &&
      valueFormatters[column.formatterKey]
      ? valueFormatters[column.formatterKey]
      : null;

  const handleClick = () => {
    if (!editing) return;

    const {
      editingCell,
      stopEdit,
    } = editing;

    if (!editingCell) return;

    const curId =
      params?.id ??
      params?.row?.id;

    const curField =
      params?.field;

    const sameId =
      String(editingCell?.id ?? "") ===
      String(curId ?? "");

    const sameField =
      String(editingCell?.field ?? "") ===
      String(curField ?? "");

    if (
      !(sameId && sameField) &&
      typeof stopEdit === "function"
    ) {
      stopEdit();
    }
  };

  let displayValue = value ?? "";
  let title = "";

  if (typeof formatter === "function") {
    try {
      displayValue = formatter(
        value,
        column.formatterOptions || {}
      );
    } catch (err) {
      console.warn(
        `Formatter error for ${column.field}`,
        err
      );
    }
  }

  if (parent === "footer") {
    if (column.aggregationFn) {
      title =
        `${column.headerName ?? column.field} ${column.aggregationFn}`;
    }

    return (
      <TableCell
        title={title}
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
        sx={baseCellSx}
      >
        <Box sx={baseInnerSx}>
          {String(displayValue)}
        </Box>
      </TableCell>
    );
  }

  if (
    typeof column.renderCell === "function" &&
    parent !== "footer" &&
    params
  ) {
    try {
      const rc = column.renderCell({
        value,
        row: params.row,
        column,
        params,
        parent,
      });

      return (
        <TableCell
          sx={baseCellSx}
          title={
            ellipsis &&
              typeof rc === "string"
              ? rc
              : undefined
          }
          onClick={handleClick}
          onDoubleClick={onDoubleClick}
        >
          <Box sx={baseInnerSx}>
            {rc}
          </Box>
        </TableCell>
      );
    } catch (e) {
      console.warn("renderCell threw:", e);
    }
  }

  if (
    column.input === "select" &&
    Array.isArray(column.options) && 
    column.type !== "number"
  ) {
    const option =
      column.options.find((opt) => {
        if (
          opt &&
          typeof opt === "object"
        ) {
          return String(opt.value) === String(value);
        }

        return String(opt) === String(value);
      });

    if (option) {
      displayValue =
        typeof option === "object"
          ? option.label ?? String(option.value)
          : String(option);
    }
  }

  if (
    column.type === "bool" ||
    column.type === "boolean" ||
    column.input === "switch" ||
    column.input === "bool"
  ) {
    return (
      <TableCell
        sx={baseCellSx}
        title={
          typeof value === "string" &&
            ellipsis
            ? String(value)
            : undefined
        }
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
      >
        <Box sx={baseInnerSx}>
          {renderBool(value, fontSize)}
        </Box>
      </TableCell>
    );
  }

  if (
    displayValue &&
    typeof displayValue === "object"
  ) {
    try {
      displayValue =
        JSON.stringify(displayValue);

      if (displayValue.length > 200) {
        displayValue =
          displayValue.slice(0, 200) + "...";
      }
    } catch {
      displayValue =
        String(displayValue);
    }
  }

  if (displayValue == null) {
    displayValue = "";
  }

  if (column.formatterKey === "link") {
    const href = String(displayValue);

    displayValue = (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "block",
          minWidth: 0,
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {href}
      </a>
    );
  }

  title =
    column.showTitle === false
      ? undefined
      : typeof displayValue === "string" &&
        ellipsis
        ? displayValue
        : undefined;

  return (
    <TableCell
      title={title}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      sx={baseCellSx}
    >
      <Box sx={baseInnerSx}>
        {displayValue}
      </Box>
    </TableCell>
  );
};

export default DisplayCell;