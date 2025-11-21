import React, { useMemo } from "react";
import { TableCell, Typography, Box } from "@mui/material";
import { valueFormatters } from "../valueFormatters";

/**
 * DisplayCell
 *
 * Props:
 * - value
 * - column (schema)
 * - settings (table-wide display settings)
 * - params (row params, should include id and row)
 * - onDoubleClick
 * - editing (optional) - hook object returned by useTableEditing (to detect other edits and stop them)
 */
const DisplayCell = ({ value, column = {}, settings = {}, parent, params = {}, onDoubleClick, editing }) => {
  const {
    sx = {},
    densityPadding = "6px 10px",
    fontSize = "0.8rem",
    wrap = true,
    ellipsis = false,
    align = column.align || "left",
  } = settings || {};

  const isVirtual = settings.isVirtualized && settings.rowHeight;

  const virtualizedClampSx = isVirtual
    ? {
        height: settings.rowHeight,
        maxHeight: settings.rowHeight,
        overflow: "hidden",
      }
    : {};

  const formatter =
    column.formatterKey && valueFormatters[column.formatterKey]
      ? valueFormatters[column.formatterKey]
      : null;

  const conditionalSx = useMemo(() => {
    if (Array.isArray(column.displayRules)) {
      for (const rule of column.displayRules) {
        if (typeof rule.condition === "function" && rule.condition(value, params.row)) {
          return rule.sx || {};
        }
      }
    }
    if (typeof column.styleFn === "function") {
      try {
        return column.styleFn(value, params) || {};
      } catch (e) {
        console.warn("styleFn error:", e);
        return {};
      }
    }
    return {};
  }, [column, value, params]);

  // single click: if some other cell is editing -> stopEdit() to abort it
  const handleClick = (e) => {
    if (!editing) return;
    const { editingCell, stopEdit } = editing;
    if (!editingCell) return;
    // determine current cell identity
    const curId = params?.id ?? params?.row?.id;
    const curField = params?.field;
    // if the editing cell is *different* than this one -> stop it
    const sameId = String(editingCell?.id ?? "") === String(curId ?? "");
    const sameField = String(editingCell?.field ?? "") === String(curField ?? "");
    if (!(sameId && sameField) && typeof stopEdit === "function") {
      stopEdit();
    }
  };

  // compute displayed value
  let displayValue = value ?? "";

  // 0️⃣ formatter applied first if provided (we'll try/catch)
  if (typeof formatter === "function") {
    try {
      displayValue = formatter(value, column.formatterOptions || {});
    } catch (err) {
      console.warn(`Formatter error for ${column.field}`, err);
    }
  }

  // 1️⃣ renderCell has highest priority (it receives params)
  if (typeof column.renderCell === "function" && parent != 'footer' && params) {
    try {
      // ja bym tu przekazał trochę bogatszy kontekst niż same params,
      // ale jeśli u Ciebie renderCell oczekuje params – zostaw jak jest:
      // const rc = column.renderCell(params);

      const rc = column.renderCell({
        value,
        row: params.row,
        column,
        params,
        parent
      });

      return (
        <TableCell
          sx={{
            height: settings.rowHeight,
            maxHeight: settings.rowHeight,
            width: column.width,
            minWidth: column.minWidth,
            maxWidth: column.maxWidth,
            padding: densityPadding,
            fontSize,
            lineHeight: 1.3,
            verticalAlign: "top",
            textAlign: align,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            ...sx,
            ...conditionalSx,
          }}
          title={ellipsis && typeof rc === "string" ? rc : undefined}
          onClick={handleClick}
          onDoubleClick={onDoubleClick}
        >
          {rc}
        </TableCell>
      );
    } catch (e) {
      console.warn("renderCell threw:", e);
    }
  }

  // 2️⃣ If input is select and we have options -> map value -> label
  if (column.input === "select" && Array.isArray(column.options)) {
    const option = column.options.find((opt) => {
      if (opt && typeof opt === "object") {
        return String(opt.value) === String(value);
      }
      return String(opt) === String(value);
    });
    if (option) {
      displayValue = typeof option === "object" ? (option.label ?? String(option.value)) : String(option);
    }
  }

  // 3️⃣ If column.type or input indicates boolean -> pretty unicode
  const renderBool = (v) => {
    const normalize = (x) => {
      if (x === null || x === undefined || x === "") return null;
      if (typeof x === "boolean") return x;
      if (typeof x === "number") return x !== 0;
      if (typeof x === "string") {
        const s = x.trim().toLowerCase();
        if (s === "1" || s === "true" || s === "yes" || s === "y") return true;
        if (s === "0" || s === "false" || s === "no" || s === "n") return false;
      }
      return null;
    };
    const nv = normalize(v);
    if (nv === null) return "";
    return (
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
        <Typography component="span" sx={{ color: nv ? "success.main" : "error.main", fontSize: fontSize }}>
          {nv ? "✓" : "✕"}
        </Typography>
        {/* optional textual hint */}
        <Typography component="span" sx={{ color: "text.secondary", fontSize: "0.8em" }}>
          {nv ? "Tak" : "Nie"}
        </Typography>
      </Box>
    );
  };

  // If explicit type suggests boolean (or input is switch)
  if ((column.type === "bool" || column.type === "boolean" || column.input === "switch" || column.input === "bool")) {
    // render boolean stylized
    return (
      <TableCell
        sx={{
          height: settings.rowHeight,
          maxHeight: settings.rowHeight,
          width: column.width,
          minWidth: column.minWidth,
          maxWidth: column.maxWidth,
          padding: densityPadding,
          fontSize,
          lineHeight: 1.3,
          verticalAlign: "top",
          textAlign: align,
          whiteSpace: "normal", // <-- NAJWAŻNIEJSZE!
          overflowWrap: "break-word", // <-- DLA PEWNOŚCI (albo wordBreak)
          wordBreak: "break-word", // <-- DLA PEWNOŚCI
          ...sx,
          ...conditionalSx,
        }}
        title={typeof value === "string" && ellipsis ? String(value) : undefined}
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
      >
        {renderBool(value)}
      </TableCell>
    );
  }

  // fallback: if displayValue is object -> stringify limited
  if (displayValue && typeof displayValue === "object") {
    try {
      displayValue = JSON.stringify(displayValue);
      if (displayValue.length > 200) displayValue = displayValue.slice(0, 200) + "...";
    } catch (e) {
      displayValue = String(displayValue);
    }
  }

  if (displayValue == null) displayValue = "";

  let title =
    column.showTitle === false
      ? undefined
      : typeof displayValue === "string" && ellipsis
        ? String(displayValue)
        : undefined;

  if(parent === 'footer'){
    if(column.aggregationFn){
      title = `${column.headerName} ${column.aggregationFn}`;
    }
  }

  return (
    <TableCell
      sx={{
        height: settings.rowHeight,
        maxHeight: settings.rowHeight,
        width: column.width,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
        padding: densityPadding,
        fontSize,
        lineHeight: 1.3,
        verticalAlign: "top",
        textAlign: align,
        overflowWrap: "break-word",
        wordBreak: "break-word",
        ...sx,
        ...conditionalSx,
        ...virtualizedClampSx,     // <--- DODANE
      }}
      title={title}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
    >
      {String(displayValue)}
    </TableCell>
  );
};

/* -------------------------------------------------------------------------- */
/* 🔹 Registry display typów (docelowo do rozbudowy)                         */
/* -------------------------------------------------------------------------- */
DisplayCell.displayMap = {
  text: ({ value }) => <>{value}</>,
  numeric: ({ value, column }) => (
    <Box sx={{ textAlign: column?.align || "right" }}>
      {value != null ? Number(value ?? 0).toLocaleString("pl-PL") : ""}
    </Box>
  ),
  bool: ({ value, column }) => {
    const v = value === 1 || value === '1' || value === true || value === 'true';
    return (
      <Box sx={{ textAlign: column?.align || "center" }}>
        <span style={{ color: v ? 'green' : 'crimson' }}>{v ? '✓' : '✕'}</span>
      </Box>
    );
  },
  date: ({ value }) => (
    <Box sx={{ textAlign: "left" }}>
      {value ? new Date(value).toLocaleDateString("pl-PL") : ""}
    </Box>
  ),
  chip: ({ value }) => (
    <Box
      component="span"
      sx={{
        background: "#eee",
        borderRadius: "8px",
        px: 1,
        py: "2px",
        fontSize: "0.75em",
      }}
    >
      {value}
    </Box>
  ),
  currency: ({ value, column }) => (
    <Box sx={{ textAlign: column?.align || "right" }}>
      {value != null ? `${Number(value ?? 0).toLocaleString("pl-PL")} zł` : ""}
    </Box>
  ),
};

export default DisplayCell;
